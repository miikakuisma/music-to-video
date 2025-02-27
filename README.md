# Music to Video

![Screenshot 2025-02-27 at 11 43 16](https://github.com/user-attachments/assets/7005e209-a770-4ec3-adf7-33bc2943dab7)

A desktop application that automatically generates aesthetic waveform videos from your audio files. Simply drag and drop your MP3 or WAV files and get beautiful visualizations perfect for YouTube, social media, or any platform that requires video format.

## ✨ Features

- Convert MP3/WAV files to waveform videos
- Built-in FFmpeg (no manual installation required)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

Note: FFmpeg is included in the application bundle - no separate installation required!

## 🚀 Getting Started

1. Download the latest release for your operating system
2. Install and launch the application
3. Drag and drop your audio file into the application
4. Configure your desired output settings (optional)
5. Click "Generate" and wait for your video

## 💻 Development

To run the project in development mode:

### Install dependencies

```bash
yarn
```

Note: When you run `yarn`, ffmpeg-static will automatically download the appropriate FFmpeg binary for your platform. The binary will be included in your application bundle when you build it.

These changes will:
1. Include FFmpeg binaries in your application bundle
2. Eliminate the need for users to install FFmpeg separately
3. Ensure cross-platform compatibility
4. Make the application more user-friendly

After making these changes, run `yarn` to install the new dependency and update your node_modules.

### Start the application

```bash
yarn start
```

### Build for your current platform

```bash
yarn build
```

## Coming up
- Vertical orientation
- Audio processing (such as normalize)
  

