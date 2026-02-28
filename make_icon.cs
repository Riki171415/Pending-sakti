using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

class Program {
    static void Main() {
        string publicDir = @"c:\ClaimAuditApp\public";
        Directory.CreateDirectory(publicDir);

        var bmp = new Bitmap(256, 256);
        var g = Graphics.FromImage(bmp);
        g.SmoothingMode = SmoothingMode.AntiAlias;

        // Background lingkaran biru tua
        g.FillEllipse(new SolidBrush(Color.FromArgb(30, 70, 140)), 8, 8, 240, 240);
        // Dokumen putih
        g.FillRectangle(Brushes.White, 68, 50, 110, 140);
        // Garis biru di dokumen
        g.FillRectangle(new SolidBrush(Color.FromArgb(30, 70, 140)), 80, 75, 86, 8);
        g.FillRectangle(new SolidBrush(Color.FromArgb(30, 70, 140)), 80, 95, 86, 8);
        g.FillRectangle(new SolidBrush(Color.FromArgb(30, 70, 140)), 80, 115, 60, 8);
        // Lingkaran hijau (check)
        g.FillEllipse(new SolidBrush(Color.FromArgb(0, 180, 100)), 130, 140, 80, 80);
        // Tanda centang putih
        var pen = new Pen(Color.White, 8);
        pen.StartCap = LineCap.Round;
        pen.EndCap = LineCap.Round;
        g.DrawLine(pen, 150, 180, 162, 195);
        g.DrawLine(pen, 162, 195, 195, 155);
        g.Dispose();

        // Simpan PNG
        string pngPath = Path.Combine(publicDir, "icon.png");
        bmp.Save(pngPath, ImageFormat.Png);
        Console.WriteLine("PNG saved: " + new FileInfo(pngPath).Length + " bytes");

        // Simpan ICO (dari 256x256)
        string icoPath = Path.Combine(publicDir, "icon.ico");
        var icon = Icon.FromHandle(bmp.GetHicon());
        using (var fs = new FileStream(icoPath, FileMode.Create))
            icon.Save(fs);
        Console.WriteLine("ICO saved: " + new FileInfo(icoPath).Length + " bytes");

        bmp.Dispose();
    }
}
