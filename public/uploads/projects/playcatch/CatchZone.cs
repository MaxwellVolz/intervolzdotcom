using UnityEngine;

public class CatchZone : MonoBehaviour
{
    private NetworkPlayer player;

    public void Init(NetworkPlayer owner)
    {
        player = owner;
    }

    private void OnTriggerEnter(Collider other)
    {
        if (player == null) return; // prevent crash
        if (!player.isLocalPlayer) return;

        if (other && other.CompareTag("Pickup")) // Or any custom tag
        {
            player.TryCatchBall(other.gameObject);
        }
    }
}
