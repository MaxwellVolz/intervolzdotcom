using Mirror;
using Steamworks;
using UnityEngine;
using Mirror.FizzySteam;

public class SteamLobbyManager : MonoBehaviour
{
    protected Callback<GameLobbyJoinRequested_t> gameLobbyJoinRequested;
    protected Callback<LobbyEnter_t> lobbyEntered;

    private const int MaxConnections = 4;
    private CSteamID currentLobbyId;

    private void Awake()
    {
        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        if (!SteamManager.Initialized)
        {
            Debug.LogError("Steam not initialized");
            return;
        }

        gameLobbyJoinRequested = Callback<GameLobbyJoinRequested_t>.Create(OnGameLobbyJoinRequested);
        lobbyEntered = Callback<LobbyEnter_t>.Create(OnLobbyEntered);
        lobbyCreated = Callback<LobbyCreated_t>.Create(OnLobbyCreated);

        // Automatically host a game unless joining one
        SteamMatchmaking.CreateLobby(ELobbyType.k_ELobbyTypeFriendsOnly, MaxConnections);
    }

    public void HostGame()
    {
        Debug.Log("Trying to HostGame()...");
        SteamMatchmaking.CreateLobby(ELobbyType.k_ELobbyTypeFriendsOnly, MaxConnections);
    }

    private void OnGameLobbyJoinRequested(GameLobbyJoinRequested_t callback)
    {
        Debug.Log($"[SteamLobby] OnGameLobbyJoinRequested: {callback.m_steamIDLobby}");

        SteamMatchmaking.JoinLobby(callback.m_steamIDLobby);
    }

    private void OnLobbyEntered(LobbyEnter_t callback)
    {
        Debug.Log("[SteamLobby] OnLobbyEntered()...");

        currentLobbyId = (CSteamID)callback.m_ulSteamIDLobby;
        Debug.Log($"[SteamLobby] Entered lobby: {currentLobbyId}");

        CSteamID lobbyOwner = SteamMatchmaking.GetLobbyOwner(currentLobbyId);
        CSteamID localSteamID = SteamUser.GetSteamID();

        Debug.Log($"[SteamLobby] Lobby Owner: {lobbyOwner}, Local Steam ID: {localSteamID}");

        if (lobbyOwner == localSteamID)
        {
            Debug.Log("[SteamLobby] This is our own hosted lobby. No action needed.");
            return;
        }

        string hostIdStr = SteamMatchmaking.GetLobbyData(currentLobbyId, "HostAddress");
        Debug.Log($"[SteamLobby] Fetched HostAddress = {hostIdStr}");

        if (NetworkServer.active || NetworkClient.active)
        {
            Debug.Log("[SteamLobby] Already hosting or connected. Stopping to join new lobby...");

            NetworkManager.singleton.StopHost();
            NetworkManager.singleton.StopClient();

            StartCoroutine(JoinAfterDelay(hostIdStr));
            return;
        }

        // Initial join
        StartCoroutine(JoinAfterDelay(hostIdStr));


        if (!string.IsNullOrEmpty(hostIdStr))
        {
            if (Transport.active is FizzySteamworks fizzy)
            {
                fizzy.ClientConnect(hostIdStr);
                Debug.Log("[SteamLobby] Called ClientConnect on FizzySteamworks");
            }
            else
            {
                Debug.LogError("[SteamLobby] FizzySteamworks transport not active!");
            }

            NetworkManager.singleton.StartClient();
            Debug.Log("[SteamLobby] StartClient called");
        }
        else
        {
            Debug.LogError("[SteamLobby] HostAddress metadata is missing or empty.");
        }
    }
    private System.Collections.IEnumerator JoinAfterDelay(string hostIdStr)
    {
        yield return new WaitForSeconds(1f); // 1s delay to allow disconnect

        if (Transport.active is FizzySteamworks fizzy)
        {
            fizzy.ClientConnect(hostIdStr);
            Debug.Log("[SteamLobby] (Delayed) Called ClientConnect on FizzySteamworks");
        }
        else
        {
            Debug.LogError("[SteamLobby] FizzySteamworks transport not active!");
        }

        NetworkManager.singleton.StartClient();
        Debug.Log("[SteamLobby] (Delayed) StartClient called");
    }


    // Called when the lobby is successfully created (Steam callback)
    protected Callback<LobbyCreated_t> lobbyCreated;

    private void OnEnable()
    {
        lobbyCreated = Callback<LobbyCreated_t>.Create(OnLobbyCreated);
    }

    private void OnLobbyCreated(LobbyCreated_t callback)
    {
        Debug.Log($"[SteamLobby] Lobby created: {callback.m_ulSteamIDLobby}");



        if (callback.m_eResult != EResult.k_EResultOK)
        {
            Debug.LogError("Lobby creation failed!");
            return;
        }

        currentLobbyId = new CSteamID(callback.m_ulSteamIDLobby);
        string hostId = SteamUser.GetSteamID().ToString();
        SteamMatchmaking.SetLobbyData(currentLobbyId, "HostAddress", hostId);
        Debug.Log($"[SteamLobby] Set HostAddress = {hostId}");


        NetworkManager.singleton.StartHost();
    }
}
