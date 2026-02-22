# Adding Tharun's Profile Picture

## Steps to Add the Image

1. Save the profile picture you shared in the chat as `tharun.jpg`
2. Place it in the `public/ppl/` folder
3. The code is already updated to use this image automatically

## Where the Image Will Appear

Once you add `public/ppl/tharun.jpg`, it will automatically show up for any user named "Tharun" or "Tharun Kumar" in:

- SAI Admin Dashboard (Analytics page)
- SAI National Leaderboard
- SAI Scouting Dashboard
- Coach Dashboard (if viewing Tharun's workouts)
- Any other page that displays athlete data

## Technical Details

The code checks for users with names containing "tharun" (case-insensitive) and automatically assigns the `/ppl/tharun.jpg` profile picture.

This is handled in:
- `src/utils/userNameTransform.ts` - Contains the `getTharunProfilePic()` function
- `src/services/mockSAIData.ts` - Uses the function when loading athlete data

## Manual Steps

If you're on Windows:
1. Right-click the image in the chat
2. Save it as `tharun.jpg`
3. Move it to: `C:\Users\Tharun\OneDrive\Pictures\talent-track-cyber\public\ppl\tharun.jpg`

Or use this command in PowerShell (from project root):
```powershell
# If you have the image saved somewhere, copy it:
Copy-Item -Path "path\to\your\image.jpg" -Destination "public\ppl\tharun.jpg"
```

## Verification

After adding the image:
1. Refresh the application
2. Navigate to SAI Admin Dashboard > Analytics
3. Look for Tharun in the athlete list
4. The new profile picture should appear

If the image doesn't show:
- Check the file is named exactly `tharun.jpg` (lowercase)
- Check it's in the correct folder: `public/ppl/`
- Clear browser cache and refresh
