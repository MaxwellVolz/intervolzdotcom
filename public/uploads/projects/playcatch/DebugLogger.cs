using UnityEngine;
using TMPro;

public class DebugLogger : MonoBehaviour
{
    [SerializeField] private TMP_Text logText;
    private string fullLog = "";

    private void Awake()
    {
        Application.logMessageReceived += HandleLog;
        if (logText != null) logText.text = "LOGGING READY";
        Debug.Log("[DebugLogger] Booted and active");
    }

    private void OnDestroy()
    {
        Application.logMessageReceived -= HandleLog;
    }

    void HandleLog(string logString, string stackTrace, LogType type)
    {
        fullLog += $"{logString}\n";
        if (logText != null)
        {
            logText.text = fullLog;
        }

        System.IO.File.AppendAllText("PlayerLog.txt", logString + "\n");
    }
}
