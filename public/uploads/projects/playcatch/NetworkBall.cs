using Mirror;
using UnityEngine;

public class NetworkBall : NetworkBehaviour
{
    [SyncVar] public int ballTypeIndex;

    [SerializeField] private MeshRenderer meshRenderer;

    public Mesh GetMesh() => meshRenderer != null ? meshRenderer.GetComponent<MeshFilter>().sharedMesh : null;
    public Material GetMaterial() => meshRenderer != null ? meshRenderer.sharedMaterial : null;
}
