using Mirror;
using StarterAssets;
using UnityEngine;
using UnityEngine.InputSystem;
using Cinemachine;
using System.Collections.Generic;

public class NetworkPlayer : NetworkBehaviour
{
    [Header("Player")]
    private PlayerInput playerInput;
    private StarterAssetsInputs input;
    [SerializeField] private GameObject playerModel;
    [SerializeField] private Transform cameraTarget;
    private Animator animator;
    private ThirdPersonController controller;
    [SerializeField] private NetworkAnimator netAnimator;
    private float pickupCooldown = 0f;
    [SerializeField] private float pickupCooldownDuration = 0.5f; // half-second block
    [SerializeField] private CatchZone catchZone;


    [Header("Throwing")]
    [SerializeField] private Transform throwOrigin;
    private float throwCharge = 0f;
    [SerializeField] private float maxCharge = 2.0f;
    [SerializeField] private float chargeSpeed = 1.0f;
    [SerializeField] private float minThrowForce = 5f;
    [SerializeField] private float maxThrowForce = 20f;

    [Header("Balls")]
    [SerializeField] private List<GameObject> ballPrefabs;
    [SerializeField] private GameObject heldBallObject;
    [SyncVar] private bool isHoldingBall = true;
    [SerializeField] private int heldBallIndex = 0;

    public GameObject GetHeldBallPrefab() => ballPrefabs[heldBallIndex];

    public override void OnStartLocalPlayer()
    {
        playerInput = GetComponent<PlayerInput>();
        input = GetComponent<StarterAssetsInputs>();
        controller = GetComponent<ThirdPersonController>();

        if (playerInput != null)
        {
            playerInput.enabled = true;

            playerInput.SwitchCurrentControlScheme("KeyboardMouse", Keyboard.current, Mouse.current);

            playerInput.ActivateInput();

            if (playerInput.camera == null)
                playerInput.camera = Camera.main;

            Debug.Log($"[Input] Bound to: {playerInput.currentControlScheme}");
        }

        var vcam = FindObjectOfType<CinemachineVirtualCamera>();
        if (vcam != null && cameraTarget != null)
        {
            vcam.Follow = cameraTarget;
            vcam.LookAt = cameraTarget;
        }
    }

    private void Start()
    {
        animator = playerModel.GetComponent<Animator>();
        controller = GetComponent<ThirdPersonController>();
        playerInput = GetComponent<PlayerInput>();
        input = GetComponent<StarterAssetsInputs>();
        catchZone?.Init(this);

        if (!isLocalPlayer)
        {
            if (playerInput) playerInput.enabled = false;
            if (controller) controller.enabled = false;
        }

        heldBallObject.SetActive(isHoldingBall);
    }

    private void Update()
    {
        if (!isLocalPlayer || input == null) return;

        if (pickupCooldown > 0f)
            pickupCooldown -= Time.deltaTime;

        // Begin charge
        if (input.isThrowingHeld && throwCharge == 0f && isHoldingBall)
        {
            netAnimator.SetTrigger("ThrowStart");
        }

        // Charging
        if (input.isThrowingHeld && isHoldingBall)
        {
            throwCharge += Time.deltaTime * chargeSpeed;
            throwCharge = Mathf.Clamp(throwCharge, 0f, maxCharge);

            Vector3 camForward = Camera.main.transform.forward;
            camForward.y = 0f;
            camForward.Normalize();
            Quaternion targetRotation = Quaternion.LookRotation(camForward);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * 10f);
        }

        // Release
        if (input.isThrowingReleased && isHoldingBall)
        {
            input.isThrowingReleased = false;

            float force = Mathf.Lerp(minThrowForce, maxThrowForce, throwCharge / maxCharge);
            throwCharge = 0f;

            netAnimator.SetTrigger("ThrowEnd");

            Vector3 direction = (Camera.main.transform.forward + Vector3.up * 0.5f).normalized;
            CmdThrowHeldBall(force, direction);
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        if (!isLocalPlayer) return;

        if (other.CompareTag("Pickup") || other.GetComponent<NetworkBall>() != null)
        {
            TryPickupBall(other.gameObject);
        }
    }

    public void TryCatchBall(GameObject ball)
    {
        if (isHoldingBall || pickupCooldown > 0f) return;

        NetworkBall data = ball.GetComponent<NetworkBall>();
        if (data == null) return;

        uint netId = ball.GetComponent<NetworkIdentity>().netId;

        netAnimator.SetTrigger("Catch");
        CmdPickupBall(netId, data.ballTypeIndex);
    }

    public void TryPickupBall(GameObject ballWorldInstance)
    {
        if (isHoldingBall || pickupCooldown > 0f) return;

        NetworkIdentity netId = ballWorldInstance.GetComponent<NetworkIdentity>();
        if (netId == null) return;

        NetworkBall data = ballWorldInstance.GetComponent<NetworkBall>();
        if (data == null) return;

        netAnimator.SetTrigger("Pickup");
        CmdPickupBall(netId.netId, data.ballTypeIndex);
    }

    [Command]
    void CmdPickupBall(uint ballNetId, int typeIndex)
    {
        if (!NetworkServer.spawned.TryGetValue(ballNetId, out NetworkIdentity netObj))
            return;

        NetworkServer.Destroy(netObj.gameObject);

        heldBallIndex = typeIndex;
        RpcSetHeldBall(true, typeIndex);
    }

    [ClientRpc]
    void RpcSetHeldBall(bool holding, int typeIndex)
    {
        isHoldingBall = holding;
        heldBallIndex = typeIndex;

        if (heldBallObject == null)
        {
            Debug.LogError("heldBallObject not assigned!");
            return;
        }

        heldBallObject.SetActive(holding);

        if (!holding) return;

        if (typeIndex < 0 || typeIndex >= ballPrefabs.Count)
        {
            Debug.LogError($"Invalid ballTypeIndex: {typeIndex}");
            return;
        }

        var source = ballPrefabs[typeIndex];
        var mf = heldBallObject.GetComponent<MeshFilter>();
        var mr = heldBallObject.GetComponent<MeshRenderer>();

        var sourceMF = source.GetComponent<MeshFilter>();
        var sourceMR = source.GetComponent<MeshRenderer>();

        if (mf && sourceMF) mf.sharedMesh = sourceMF.sharedMesh;
        if (mr && sourceMR) mr.sharedMaterial = sourceMR.sharedMaterial;

        Debug.Log($"Set held ball to prefab[{typeIndex}]: {source.name}");
    }



    [Command]
    void CmdThrowHeldBall(float force, Vector3 direction)
    {
        if (!isHoldingBall) return;

        GameObject prefabToThrow = GetHeldBallPrefab();
        if (prefabToThrow == null)
        {
            Debug.LogError("No ball prefab assigned to heldBallIndex!");
            return;
        }

        Vector3 spawnPos = heldBallObject.transform.position + direction * 0.3f + Vector3.up * 0.1f;
        GameObject ball = Instantiate(prefabToThrow, spawnPos, Quaternion.LookRotation(direction));
        NetworkServer.Spawn(ball);

        Rigidbody rb = ball.GetComponent<Rigidbody>();
        rb.velocity = direction * force;

        RpcApplyForce(ball, direction * force);
        RpcSetHeldBall(false, 0);
        isHoldingBall = false;
        pickupCooldown = pickupCooldownDuration;
    }

    [ClientRpc]
    void RpcApplyForce(GameObject ball, Vector3 velocity)
    {
        if (ball == null) return;
        Rigidbody rb = ball.GetComponent<Rigidbody>();
        if (rb != null) rb.velocity = velocity;
    }
}
