using UnityEngine;
using Steamworks;

[DisallowMultipleComponent]
public class SteamManager : MonoBehaviour
{
    private static SteamManager s_instance;
    private static bool s_EverInitialized;

    private bool m_bInitialized;

    public static bool Initialized
    {
        get { return s_instance != null && s_instance.m_bInitialized; }
    }

    private void Awake()
    {
        if (s_instance != null)
        {
            Destroy(gameObject);
            return;
        }

        s_instance = this;
        DontDestroyOnLoad(gameObject);

        if (!Packsize.Test())
        {
            Debug.LogError("[Steamworks.NET] Packsize Test failed.");
        }

        if (!DllCheck.Test())
        {
            Debug.LogError("[Steamworks.NET] DllCheck Test failed.");
        }

        try
        {
            m_bInitialized = SteamAPI.Init();
        }
        catch (System.DllNotFoundException e)
        {
            Debug.LogError("[Steamworks.NET] Could not load steam_api64.dll: " + e);
            return;
        }

        if (!m_bInitialized)
        {
            Debug.LogError("SteamAPI_Init() failed.");
        }
    }

    private void OnEnable()
    {
        if (s_instance == null) s_instance = this;
    }

    private void OnDestroy()
    {
        if (s_instance != this) return;

        s_instance = null;

        if (!m_bInitialized) return;

        SteamAPI.Shutdown();
    }

    private void Update()
    {
        if (!m_bInitialized) return;

        SteamAPI.RunCallbacks();
    }
}
