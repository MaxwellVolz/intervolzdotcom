# Game Screenshots

This folder contains gameplay screenshots used as backgrounds for overlay demonstrations.

## Folder Structure

```
screenshots/
├── counterstrike/     # Counter-Strike 2 gameplay
├── dark-and-darker/   # Dark and Darker dungeon runs
├── dota2/             # Dota 2 matches
├── rust/              # Rust survival
├── valorant/          # Valorant matches
├── elden-ring/        # Elden Ring gameplay
└── README.md          # This file
```

## Screenshot Guidelines

### General Requirements
- **Resolution**: 1920x1080 (16:9 aspect ratio) minimum
- **Format**: PNG or JPG
- **Quality**: High quality, no compression artifacts
- **File Size**: Optimize to < 500KB per image

### Composition Requirements
- Show typical in-game view (first-person, third-person, or top-down)
- Include game HUD elements (health, ammo, minimap, etc.)
- Avoid menus, loading screens, or static UI
- Capture during actual gameplay for authenticity
- Leave space in center/sides for overlay placement

### Per-Game Specific Guidelines

#### Counter-Strike 2
- First-person view during match
- Show crosshair, health/armor, ammo count
- Include radar/minimap if possible
- Capture during round (not buy phase)
- File: `counterstrike/gameplay-1.jpg`

#### Dark and Darker
- In-dungeon first-person view
- Show inventory/hotbar
- Include health bar and character status
- Torch/lighting visible
- File: `dark-and-darker/dungeon-1.jpg`

#### Dota 2
- Top-down game view
- Show hero, abilities, items
- Include minimap
- Capture during laning or team fight
- File: `dota2/match-1.jpg`

#### Rust
- First-person survival view
- Show health, hunger, inventory hotbar
- Include building or environment
- Daytime for better visibility
- File: `rust/survival-1.jpg`

#### Valorant
- First-person competitive match
- Show abilities, ammo, minimap
- Include agent UI elements
- Round in progress
- File: `valorant/match-1.jpg`

#### Elden Ring
- Third-person gameplay
- Show health/stamina/FP bars
- Include equipment and quick items
- Open world or dungeon area
- File: `elden-ring/gameplay-1.jpg`

## Naming Convention

Use descriptive names:
- `gameplay-1.jpg` - General gameplay shot
- `combat-1.jpg` - Combat scenario
- `inventory-1.jpg` - Inventory screen view
- `map-1.jpg` - Map or strategic view

## Usage in Components

Screenshots are referenced in game scene components:
```tsx
<img
  src="/screenshots/counterstrike/gameplay-1.jpg"
  alt="Counter-Strike gameplay"
  className="absolute inset-0 w-full h-full object-cover"
/>
```

## Image Optimization

Before adding screenshots:
1. Resize to 1920x1080 if larger
2. Compress using tools like TinyPNG or ImageOptim
3. Convert to WebP for better performance (optional)
4. Keep originals in a separate backup folder

## Copyright Notice

**Important**: Only use screenshots you have taken yourself or have explicit permission to use. Do not use copyrighted material without proper licensing.

- Screenshots from your own gameplay: ✅ OK
- Official press kit images: ✅ OK (check license)
- Random internet images: ❌ Not OK
- Streamer/content creator shots: ❌ Not OK (without permission)

## Tips for Taking Screenshots

### Counter-Strike 2
- `F5` or `F12` (Steam screenshot)
- Hide HUD: `cl_draw_only_deathnotices 1`
- Record demo and capture specific frames

### Dark and Darker
- `F12` (Steam screenshot)
- Use in-game photo mode if available

### General
- Use windowed mode at 1920x1080 for consistent resolution
- Take multiple shots from different angles
- Capture during interesting moments (combat, exploration)
- Avoid UI-heavy moments (menus, settings)

## Current Status

| Game | Screenshots | Status |
|------|-------------|--------|
| Counter-Strike 2 | 0 | ⏳ Needed |
| Dark and Darker | 0 | ⏳ Needed |
| Dota 2 | 0 | ⏳ Needed |
| Rust | 0 | ⏳ Needed |
| Valorant | 0 | ⏳ Needed |
| Elden Ring | 0 | ⏳ Needed |

Add your screenshots and update this table!
