import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, ImageIcon } from "lucide-react";

export const ThemeControl = () => {
  const { theme, updateTheme } = useThemeSettings();
  const { toast } = useToast();
  
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [borderRadius, setBorderRadius] = useState("0.75");
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (theme) {
      // Convert HSL to hex for color pickers
      setPrimaryColor(hslToHex(theme.primary_color));
      setAccentColor(hslToHex(theme.accent_color));
      setBackgroundColor(hslToHex(theme.background_color));
      setTextColor(hslToHex(theme.foreground_color));
      setBorderRadius(theme.border_radius.replace('rem', ''));
    }
  }, [theme]);

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 0%";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const hDecimal = l / 100;
    const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveTheme = async () => {
    setUploading(true);
    try {
      let wallpaperUrl = theme?.wallpaper_url;
      let logoUrl = theme?.logo_url;

      if (wallpaperFile) {
        wallpaperUrl = await uploadFile(wallpaperFile, 'profile-pictures');
      }

      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'profile-pictures');
      }

      updateTheme({
        primary_color: hexToHsl(primaryColor),
        accent_color: hexToHsl(accentColor),
        background_color: hexToHsl(backgroundColor),
        foreground_color: hexToHsl(textColor),
        border_radius: `${borderRadius}rem`,
        wallpaper_url: wallpaperUrl,
        logo_url: logoUrl,
      });

      setWallpaperFile(null);
      setLogoFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Control</CardTitle>
        <CardDescription>Customize the app's appearance for all users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#0f172a"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Border Radius (rem)</Label>
          <Input
            type="number"
            step="0.25"
            value={borderRadius}
            onChange={(e) => setBorderRadius(e.target.value)}
            placeholder="0.75"
          />
        </div>

        <div className="space-y-2">
          <Label>App Wallpaper/Background</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setWallpaperFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            {theme?.wallpaper_url && (
              <ImageIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          {wallpaperFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {wallpaperFile.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>App Logo</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            {theme?.logo_url && (
              <ImageIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          {logoFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {logoFile.name}
            </p>
          )}
        </div>

        <Button 
          onClick={handleSaveTheme} 
          className="w-full"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Save Theme (Applied to All Users)'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
