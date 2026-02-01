
import React from 'react';
import { DmgConfig, GuideStep } from './types';

export const INITIAL_CONFIG: DmgConfig = {
  background: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', // Fallback high-quality dark abstract or user can upload theirs. 
  // NOTE: I am setting a high-quality placeholder that matches the 'vibe' of the uploaded image since I cannot reliably hardcode a massive base64 in this snippet, but I will adjust the coordinates to match the provided image's composition.
  windowSize: { width: 800, height: 800 },
  appPosition: { x: 200, y: 400 },
  applicationFolderPosition: { x: 600, y: 400 },
  iconSize: 128,
  title: "Punk Package",
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'intro',
    title: 'Introduction to Tauri DMG',
    description: 'Tauri uses a native packaging tool to create DMGs. Customization is handled in your tauri.conf.json under the bundle > dmg section.',
  },
  {
    id: 'icons',
    title: 'App Icons & Assets',
    description: 'Ensure your app icon is in .icns format for macOS. Place it in src-tauri/icons. For the DMG, you can define specific icons.',
    codeSnippet: `"bundle": {\n  "icon": [\n    "icons/32x32.png",\n    "icons/128x128.png",\n    "icons/128x128@2x.png",\n    "icons/icon.icns",\n    "icons/icon.ico"\n  ]\n}`
  },
  {
    id: 'background',
    title: 'Custom DMG Background',
    description: 'Create a background image (e.g., 660x400px). Use design software to include arrows or instructions pointing to the Applications folder.',
    codeSnippet: `"dmg": {\n  "background": "assets/dmg-background.png"\n}`
  },
  {
    id: 'positioning',
    title: 'Visual Positioning',
    description: 'Define where the App icon and the Applications shortcut appear in the window. Use the visual editor on the left to find the perfect coordinates.',
    codeSnippet: `"dmg": {\n  "appPosition": { "x": 180, "y": 170 },\n  "applicationFolderPosition": { "x": 480, "y": 170 }\n}`
  }
];
