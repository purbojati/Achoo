# Achoo! 🐠

A **3D** aquarium simulation game built with Three.js and TypeScript. Feed your adorable **clownfish**, watch them grow in 3D, collect eggs for points, and build your underwater family!

## Screenshots

The game features beautiful 3D graphics with:
- **Vibrant Clownfish** - Sprite-based clownfish with orange and white stripes that evolve through life stages
- **Realistic fish movement** - Fish properly face the direction they're swimming
- Iridescent 3D eggs that float upward
- Two-toned tablet food (red & cream capsules)
- Animated seaweed and bubbles
- Glass tank with frame and sandy bottom

## Gameplay

### Core Mechanics

- **Click to Feed** - Click anywhere in the tank to drop a food tablet (costs 1 point)
- **Fish Growth** - Fish eat food and grow through 4 life stages, getting larger in 3D
- **Egg Production** - Adult and Elder fish produce glowing 3D eggs periodically
- **Egg Collection** - Click eggs to collect them instantly, or wait for auto-collect
- **Buy Fish** - Spend points to add new baby fish to your aquarium (max 10 fish)
- **Survival** - Keep your fish fed! They shrink and die if starved
- **Lifespan** - Fish age over time and eventually die of old age

### Fish Lifecycle

| Stage | Size | Produces Eggs | Egg Multiplier | Lifespan |
|-------|------|---------------|----------------|----------|
| Baby | 0.3 - 0.5 | No | - | ~3 min |
| Juvenile | 0.5 - 0.8 | No | - | ~5.4 min |
| Adult | 0.8 - 1.2 | Yes | 1x | ~7.5 min |
| Elder | 1.2 - 1.5 | Yes | 2x | ~10.5 min |

### Fish Death

Fish can die from two causes:

1. **Starvation** - If not fed, fish shrink over time. When they get too small, they die.
2. **Old Age** - Each fish has a lifespan. When they reach the end, they die naturally.

When a fish dies:
- Their color turns **sickly green-gray**
- They show **X eyes** (dead eyes)
- They **flip upside down** (belly up)
- They **float to the surface**
- They **fade away** and disappear

### Economy

| Item | Points |
|------|--------|
| Starting Points | 100 |
| Food Cost (per click) | -1 |
| Egg Value | 10-50+ (based on fish size) |
| New Baby Fish | 50 |
| Max Fish | 10 |

## 3D Features

### Clownfish Sprites
- **Beautiful SVG-based clownfish** with classic orange and white stripe patterns
- **Dual-texture system** - Separate left and right-facing sprites for realistic movement
- Four distinct life stages with unique appearances:
  - 🐣 **Baby** - Small, light orange clownfish
  - 🐟 **Juvenile** - Growing with more defined stripes
  - 🐠 **Adult** - Full-colored with three white stripes
  - 👑 **Elder** - Majestic with golden highlights
- **Dead fish sprites** - When dying, fish swap to special "dead" versions with:
  - Sickly green-gray coloring
  - X eyes (crossed out eyes)
  - Tongue sticking out
  - Dizzy swirl effects above head
- Smooth swimming animations with bobbing effects
- **Proper directional facing** - Fish face left when swimming left, right when swimming right

### Natural Fish Movement
Each fish has **realistic swimming behavior**:
- **Angle-based movement** - Fish swim in the direction they're facing
- **Smooth turning** - Fish gradually rotate to face their target
- **No backwards swimming** - Fish must turn around to change direction
- **Sprite swapping** - Fish texture changes based on swim direction
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
- **Two-toned capsule tablets** (red & cream)
- Tumbling animation while sinking
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
│   ├── FishModel.ts           # Dual-sprite clownfish with L/R textures
│   ├── EggModel.ts            # Procedural 3D egg geometry
│   ├── FoodModel.ts           # Two-toned capsule tablet
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

public/
└── assets/
    └── fish/
        └── clownfish/
            ├── clownfish-baby.svg              # Baby fish (facing right)
            ├── clownfish-baby-left.svg          # Baby fish (facing left)
            ├── clownfish-juvenile.svg           # Juvenile fish (facing right)
            ├── clownfish-juvenile-left.svg      # Juvenile fish (facing left)
            ├── clownfish-adult.svg              # Adult fish (facing right)
            ├── clownfish-adult-left.svg         # Adult fish (facing left)
            ├── clownfish-elder.svg             # Elder fish (facing right)
            ├── clownfish-elder-left.svg          # Elder fish (facing left)
            ├── clownfish-dead-baby.svg           # Dead baby fish (facing right)
            ├── clownfish-dead-baby-left.svg      # Dead baby fish (facing left)
            ├── clownfish-dead-juvenile.svg       # Dead juvenile fish (facing right)
            ├── clownfish-dead-juvenile-left.svg  # Dead juvenile fish (facing left)
            ├── clownfish-dead-adult.svg           # Dead adult fish (facing right)
            ├── clownfish-dead-adult-left.svg     # Dead adult fish (facing left)
            ├── clownfish-dead-elder.svg          # Dead elder fish (facing right)
            └── clownfish-dead-elder-left.svg     # Dead elder fish (facing left)
```

## How to Play

1. **Start** - Click PLAY on the menu screen
2. **Feed** - Click anywhere in the 3D tank to drop a food tablet
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
- Growth is slow and gradual - be patient and keep feeding consistently
- Food is cheap (1 point) - feed often to keep fish healthy!
- Fish have limited lifespans - plan ahead and buy new fish before elders die
- Bigger fish live longer - help them grow to extend their lifespan
- When a fish starts looking green and flips over, it's dying - time to say goodbye!

## Customizing Fish Sprites

The game uses SVG sprites organized by fish type in `public/assets/fish/{fishType}/`. Each stage has two versions:
- **Right-facing**: `{fishType}-{stage}.svg`
- **Left-facing**: `{fishType}-{stage}-left.svg`
- **Dead versions**: `{fishType}-dead-{stage}.svg` and `{fishType}-dead-{stage}-left.svg`

Currently, all fish sprites are in `public/assets/fish/clownfish/`.

### Using AI-Generated Images

You can replace these with AI-generated images! Here's how:

1. Generate clownfish images using AI tools like:
   - DALL-E 3
   - Midjourney
   - Stable Diffusion
   
2. Use prompts like:
   ```
   "Cute cartoon clownfish, side view facing right, orange and white stripes, 
   transparent background, game sprite style, vibrant colors"
   ```
   
   Then generate the left-facing version:
   ```
   "Cute cartoon clownfish, side view facing left, orange and white stripes, 
   transparent background, game sprite style, vibrant colors"
   ```

3. Save as PNG with transparent background (recommended size: 200x120 pixels)

4. Replace the SVG files with your PNG images (you need BOTH directions):
   ```
   public/assets/fish/clownfish/clownfish-baby.png
   public/assets/fish/clownfish/clownfish-baby-left.png
   public/assets/fish/clownfish/clownfish-juvenile.png
   public/assets/fish/clownfish/clownfish-juvenile-left.png
   public/assets/fish/clownfish/clownfish-adult.png
   public/assets/fish/clownfish/clownfish-adult-left.png
   public/assets/fish/clownfish/clownfish-elder.png
   public/assets/fish/clownfish/clownfish-elder-left.png
   ```

5. Update `src/models/FishModel.ts` to load `.png` instead of `.svg`:
   ```typescript
   const path = `/assets/fish/${fishType}/${fishType}-${stage}${dir}.png`;
   ```

## License

MIT
