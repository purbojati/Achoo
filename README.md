# Achoo! 🐠

A **3D** aquarium simulation game built with Three.js and TypeScript. Feed your adorable **clownfish**, watch them grow in 3D, collect eggs for points, and build your underwater family!

## Screenshots

The game features beautiful 3D graphics with:
- **Vibrant Clownfish** - Sprite-based clownfish with orange and white stripes that evolve through life stages
- Iridescent 3D eggs that float upward
- Sinking 3D food pellets
- Animated seaweed and bubbles
- Glass tank with frame and sandy bottom

## Gameplay

### Core Mechanics

- **Click to Feed** - Click anywhere in the tank to drop 3D food pellets (costs 5 points)
- **Fish Growth** - Fish eat food and grow through 4 life stages, getting larger in 3D
- **Egg Production** - Adult and Elder fish produce glowing 3D eggs periodically
- **Egg Collection** - Click eggs to collect them instantly, or wait for auto-collect
- **Buy Fish** - Spend points to add new baby fish to your aquarium (max 10 fish)
- **Survival** - Keep your fish fed! They shrink and die if starved

### Fish Lifecycle

| Stage | Size | Produces Eggs | Egg Multiplier |
|-------|------|---------------|----------------|
| Baby | 0.3 - 0.5 | No | - |
| Juvenile | 0.5 - 0.8 | No | - |
| Adult | 0.8 - 1.2 | Yes | 1x |
| Elder | 1.2 - 1.5 | Yes | 2x |

### Economy

| Item | Points |
|------|--------|
| Starting Points | 100 |
| Food Cost (per click) | -5 |
| Egg Value | 10-50+ (based on fish size) |
| New Baby Fish | 50 |
| Max Fish | 10 |

## 3D Features

### Clownfish Sprites
- **Beautiful SVG-based clownfish** with classic orange and white stripe patterns
- Four distinct life stages with unique appearances:
  - 🐣 **Baby** - Small, light orange clownfish
  - 🐟 **Juvenile** - Growing with more defined stripes
  - 🐠 **Adult** - Full-colored with three white stripes
  - 👑 **Elder** - Majestic with golden highlights
- Smooth swimming animations with bobbing and breathing effects
- Natural turning animation (fish can't swim backwards!)

### Natural Fish Movement
Each fish has **realistic swimming behavior**:
- **Angle-based movement** - Fish swim in the direction they're facing
- **Smooth turning** - Fish gradually rotate to face their target
- **No backwards swimming** - Fish must turn around to change direction
- **Wave motion** - Subtle side-to-side wiggle while swimming
- **Body tilt** - Fish tilt when swimming up/down or turning

### Unique Fish Personalities
Every fish is born with randomized traits, making each one behave differently:

| Trait | Effect |
|-------|--------|
| Speed | Some fish swim faster than others (0.7x - 1.3x) |
| Turn Speed | How quickly the fish can turn (0.6x - 1.4x) |
| Wander Frequency | How often they change direction |
| Wave Amplitude | How much they wiggle while swimming |
| Vertical Bias | Preference for swimming up or down |
| Restlessness | How far they tend to wander |

This means multiple fish in the tank will all swim with their own unique style!

### Tank Environment
- Glass walls with blue frame
- Sandy bottom with scattered pebbles
- Animated seaweed plants
- Rising bubble particle system
- Underwater lighting and fog

### Egg Model
- Iridescent oval shape
- Glow effect
- Floating animation
- Rotation while rising

### Food Model
- Small spheres with tumbling animation
- Sinking physics
- Fade out over time

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Achoo

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Tech Stack

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server

## Project Structure

```
src/
├── main.ts                    # Entry point
├── config/
│   └── gameConfig.ts          # Game constants & 3D world config
├── core/
│   ├── Game.ts                # Main game class
│   ├── Scene3D.ts             # Three.js scene, camera, lighting
│   └── InputManager.ts        # Raycaster click detection
├── models/
│   ├── FishModel.ts           # Sprite-based clownfish with textures
│   ├── EggModel.ts            # Procedural 3D egg geometry
│   ├── FoodModel.ts           # Procedural 3D food geometry
│   └── TankModel.ts           # Tank environment (walls, sand, seaweed)
├── entities/
│   ├── Fish3D.ts              # Fish entity with AI, personality, growth
│   ├── Egg3D.ts               # Egg entity with collection logic
│   └── Food3D.ts              # Food entity with sinking physics
├── managers/
│   └── GameManager.ts         # Points, fish count, game state
└── ui/
    ├── UIManager.ts           # HTML overlay UI
    └── styles.css             # UI styling
```

## How to Play

1. **Start** - Click PLAY on the menu screen
2. **Feed** - Click anywhere in the 3D tank to drop food pellets
3. **Watch** - See your clownfish naturally swim and turn toward food
4. **Grow** - Fish gradually grow larger as they eat (patience pays off!)
5. **Collect** - Click glowing eggs to collect points
6. **Expand** - Buy more fish when you have enough points
7. **Observe** - Each fish has unique personality traits affecting how they swim
8. **Survive** - Don't let all your fish starve!

## Tips

- Feed fish near them so they can reach food quickly
- Adult fish are your main source of income - keep them alive!
- Elder fish produce 2x value eggs - worth growing fish to max size
- Balance spending on food vs saving for new fish
- Watch your fish swim naturally - each has unique movement patterns!
- Fish need time to turn around, so drop food in front of them
- Growth is gradual - be patient and keep feeding consistently

## Customizing Fish Sprites

The game uses SVG sprites for the clownfish located in `public/assets/`:
- `clownfish-baby.svg`
- `clownfish-juvenile.svg`
- `clownfish-adult.svg`
- `clownfish-elder.svg`

### Using AI-Generated Images

You can replace these with AI-generated images! Here's how:

1. Generate clownfish images using AI tools like:
   - DALL-E 3
   - Midjourney
   - Stable Diffusion
   
2. Use prompts like:
   ```
   "Cute cartoon clownfish, side view, orange and white stripes, 
   transparent background, game sprite style, vibrant colors"
   ```

3. Save as PNG with transparent background (recommended size: 200x120 pixels)

4. Replace the SVG files with your PNG images:
   ```
   public/assets/clownfish-baby.png
   public/assets/clownfish-juvenile.png
   public/assets/clownfish-adult.png
   public/assets/clownfish-elder.png
   ```

5. Update `src/models/FishModel.ts` to load `.png` instead of `.svg`:
   ```typescript
   const path = `/assets/clownfish-${stage}.png`;
   ```

## License

MIT
