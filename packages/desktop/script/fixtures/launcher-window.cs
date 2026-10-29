using System;
using System.IO;
using System.Runtime.InteropServices;

public class LauncherWindow
{
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern IntPtr CreateWindowExW(uint extendedStyle, string className, string title,
        uint style, int x, int y, int width, int height, IntPtr parent, IntPtr menu,
        IntPtr instance, IntPtr parameter);

    [DllImport("user32.dll")]
    static extern bool ShowWindow(IntPtr window, int command);

    [DllImport("user32.dll")]
    static extern bool IsWindowVisible(IntPtr window);

    [DllImport("user32.dll")]
    static extern bool DestroyWindow(IntPtr window);

    public static void Main()
    {
        var window = CreateWindowExW(0, "STATIC", "Renicode launcher visibility fixture",
            0x00CF0000, 0, 0, 100, 100, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero);
        if (window == IntPtr.Zero) throw new Exception("Cannot create fixture window");
        try
        {
            // Windows applies STARTUPINFO's show command to this first ShowWindow call.
            ShowWindow(window, 5);
            File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "visible.txt"),
                IsWindowVisible(window) ? "visible" : "hidden");
        }
        finally
        {
            DestroyWindow(window);
        }
    }
}
