# ElevenLabs TTS Setup

## API Key Configuration

Your new ElevenLabs API key has been configured:
```
sk_13ed8cfd81fd78a344ccc46acad2aab3b7e1de99d7ec26b3
```

## Setup Steps

1. **Create .env.local file** (if not already created):
   ```bash
   # Copy from example
   cp .env.local.example .env.local
   ```

2. **Add your API key to .env.local**:
   ```env
   VITE_ELEVENLABS_API_KEY=sk_13ed8cfd81fd78a344ccc46acad2aab3b7e1de99d7ec26b3
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Voice Configuration

The app now uses **Adam** voice (free tier compatible) instead of Rachel.

### Free Tier Limitations

ElevenLabs free tier has these limitations:
- ❌ Cannot use library voices (like Rachel, Bella, etc.) via API
- ✅ Can use: Adam, Antoni, Arnold, Callum, Charlie, Charlotte, Clyde, Daniel, Dave, Domi, Dorothy, Drew, Emily, Elli, Ethan, Fin, Freya, George, Gigi, Giovanni, Glinda, Grace, Harry, James, Jeremy, Jessie, Joseph, Josh, Liam, Matilda, Matthew, Michael, Mimi, Nicole, Patrick, Paul, Rachel (premade), Sam, Serena, Thomas, Will

### Current Voice

- **Voice ID**: `pNInz6obpgDQGcFmaJgB` (Adam)
- **Type**: Free tier compatible
- **Characteristics**: Deep, authoritative, male voice

### Changing Voice

To use a different voice, update the `voiceId` in `src/services/elevenLabsTTS.ts`:

```typescript
private voiceId: string = 'YOUR_VOICE_ID_HERE';
```

Available free tier voice IDs:
- Adam: `pNInz6obpgDQGcFmaJgB`
- Antoni: `ErXwobaYiN019PkySvjV`
- Arnold: `VR6AewLTigWG4xSOukaG`
- Bella: `EXAVITQu4vr4xnSDxMaL`
- Callum: `N2lVS1w4EtoT3dr4eOWO`
- Charlie: `IKne3meq5aSn9XLyUdCD`
- Charlotte: `XB0fDUnXU5powFXDhCwa`
- Clyde: `2EiwWnXFnvU5JabPnv8n`
- Daniel: `onwK4e9ZLuTAKqWW03F9`
- Dave: `CYw3kZ02Hs0563khs1Fj`
- Domi: `AZnzlk1XvdvUeBnXmlld`
- Dorothy: `ThT5KcBeYPX3keUQqHPh`
- Drew: `29vD33N1CtxCmqQRPOHJ`
- Emily: `LcfcDJNUP1GQjkzn1xUU`
- Elli: `MF3mGyEYCl7XYWbV9V6O`
- Ethan: `g5CIjZEefAph4nQFvHAz`
- Fin: `D38z5RcWu1voky8WS1ja`
- Freya: `jsCqWAovK2LkecY7zXl4`
- George: `JBFqnCBsd6RMkjVDRZzb`
- Gigi: `jBpfuIE2acCO8z3wKNLl`
- Giovanni: `zcAOhNBS3c14rBihAFp1`
- Glinda: `z9fAnlkpzviPz146aGWa`
- Grace: `oWAxZDx7w5VEj9dCyTzz`
- Harry: `SOYHLrjzK2X1ezoPC6cr`
- James: `ZQe5CZNOzWyzPSCn5a3c`
- Jeremy: `bVMeCyTHy58xNoL34h3p`
- Jessie: `t0jbNlBVZ17f02VDIeMI`
- Joseph: `Zlb1dXrM653N07WRdFW3`
- Josh: `TxGEqnHWrfWFTfGW9XjX`
- Liam: `TX3LPaxmHKxFdv7VOQHJ`
- Matilda: `XrExE9yKIg1WjnnlVkGX`
- Matthew: `Yko7PKHZNXotIFUBG7I9`
- Michael: `flq6f7yk4E4fJM5XTYuZ`
- Mimi: `zrHiDhphv9ZnVXBqCLjz`
- Nicole: `piTKgcLEGmPE4e6mEKli`
- Patrick: `ODq5zmih8GrVes37Dizd`
- Paul: `5Q0t7uMcjvnagumLfvZi`
- Sam: `yoZ06aMxZJJ28mfd3POQ`
- Serena: `pMsXgVXv3BLzUgSXRplE`
- Thomas: `GBv7mTt0atIp3Br8iCZE`
- Will: `bIHbv24MWmeRgasZH58o`

## Troubleshooting

### 402 Payment Required Error

If you see this error:
```
ElevenLabs API error: 402 - payment_required
```

**Solution**: The voice you're trying to use requires a paid plan. Switch to a free tier voice (like Adam).

### No Sound

1. Check browser console for errors
2. Verify API key is correct in `.env.local`
3. Restart dev server after changing `.env.local`
4. Check browser audio permissions

### Fallback to Browser TTS

If ElevenLabs fails, the app automatically falls back to browser TTS (Microsoft Edge TTS or similar). This is normal and ensures voice coaching always works.

## Testing

To test the TTS:
1. Start a workout
2. Listen for voice coaching
3. Check browser console for TTS logs
4. If using ElevenLabs, you should see: "✅ ElevenLabs TTS initialized"
5. If falling back, you'll see: "☁️ ElevenLabs error" followed by "🔄 Falling back to browser TTS"

## Production Deployment

For Vercel/production:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add: `VITE_ELEVENLABS_API_KEY` = `sk_13ed8cfd81fd78a344ccc46acad2aab3b7e1de99d7ec26b3`
5. Redeploy

## API Usage Limits

Free tier limits:
- 10,000 characters per month
- ~10 minutes of audio per month

Monitor usage at: https://elevenlabs.io/app/usage
