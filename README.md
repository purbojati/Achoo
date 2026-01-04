# Achoo! 🐠

A **3D** aquarium simulation game built with Three.js and TypeScript. Feed your adorable fish, watch them grow in 3D, collect eggs for points, and build your underwater family! Beware of the shark! 🦈

## Screenshots

The game features beautiful 3D graphics with:
- **Multiple Fish Types** - Choose between Clownfish and rare Glowfish with different prices and egg values
- **Vibrant Clownfish** - Classic orange and white stripes that evolve through life stages
- **Bioluminescent Glowfish** - Rare cyan glowing fish with higher egg values (2x multiplier!)
- **Realistic fish movement** - Fish properly face the direction they're swimming
- **Shark Attacks** - Random shark appearances that hunt and eat your fish!
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

### Fish Types

| Fish Type | Cost | Egg Multiplier | Speed | Description |
|-----------|------|----------------|-------|-------------|
| 🐠 **Clownfish** | 50 pts | 1x | Normal | Classic orange clownfish |
| ✨ **Glowfish** | 100 pts | 2x | 1.2x | Rare bioluminescent fish with cyan glow |

### Economy

| Item | Points |
|------|--------|
| Starting Points | 100 |
| Food Cost (per click) | -1 |
| Egg Value | 10-50+ (based on fish size & type) |
| Clownfish | 50 |
| Glowfish | 100 |
| Max Fish | 10 |

### 🦈 Shark Attacks

Watch out! Sharks randomly appear to hunt your fish:

- **Spawn Interval**: Every 1-3 minutes
- **Warning**: 2-second warning before shark arrives
- **Duration**: Stays for 15 seconds
- **Behavior**: Hunts and eats up to 2 fish per visit
- **Strategy**: No way to stop the shark - protect your valuable fish by having backup!

When a shark approaches:
- A red warning appears: "🦈 SHARK INCOMING!"
- The shark enters from outside the tank
- It swims faster than regular fish
- After eating or time runs out, it leaves

## 3D Features

### Fish Sprites
- **Beautiful SVG-based fish** - Two unique fish types with distinct visual styles
- **Dual-texture system** - Separate left and right-facing sprites for realistic movement
- Four distinct life stages for each fish type with unique appearances

#### 🐠 Clownfish Stages
  - 🐣 **Baby** - Small, light orange clownfish
  - 🐟 **Juvenile** - Growing with more defined stripes
  - 🐠 **Adult** - Full-colored with three white stripes
  - 👑 **Elder** - Majestic with golden highlights

#### ✨ Glowfish Stages
  - 🐣 **Baby** - Small cyan fish with soft glow
  - 🐟 **Juvenile** - Growing with bioluminescent spots
  - 🐠 **Adult** - Full glow effect with stripe patterns
  - 👑 **Elder** - Maximum luminescence with golden crown aura

#### Dead Fish Sprites
- When dying, fish swap to special "dead" versions with:
  - Sickly green-gray coloring (dimmed glow for glowfish)
  - X eyes (crossed out eyes)
  - Tongue sticking out
  - Dizzy swirl effects above head
- Smooth swimming animations with bobbing effects
- **Proper directional facing** - Fish face left when swimming left, right when swimming right

### 🦈 Shark Model
- Menacing gray shark with white underbelly
- Sharp teeth and intimidating eyes
- Iconic dorsal fin silhouette
- Smooth hunting animations

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
│   └── gameConfig.ts          # Game constants, fish types & shark config
├── core/
│   ├── Game.ts                # Main game class with shark spawning
│   ├── Scene3D.ts             # Three.js scene, camera, lighting
│   └── InputManager.ts        # Raycaster click detection
├── models/
│   ├── FishModel.ts           # Multi-fish-type sprite system
│   ├── EggModel.ts            # Procedural 3D egg geometry
│   ├── FoodModel.ts           # Two-toned capsule tablet
│   └── TankModel.ts           # Tank environment (walls, sand, seaweed)
├── entities/
│   ├── Fish3D.ts              # Fish entity with AI, personality, types
│   ├── Shark3D.ts             # Shark predator entity
│   ├── Egg3D.ts               # Egg entity with collection logic
│   └── Food3D.ts              # Food entity with sinking physics
├── managers/
│   └── GameManager.ts         # Points, fish count, shark stats
└── ui/
    ├── UIManager.ts           # HTML overlay UI with fish selection
    └── styles.css             # UI styling with shark warning

public/
└── assets/
    └── fish/
        ├── clownfish/         # Classic orange clownfish sprites
        │   ├── clownfish-{stage}.svg
        │   ├── clownfish-{stage}-left.svg
        │   ├── clownfish-dead-{stage}.svg
        │   └── clownfish-dead-{stage}-left.svg
        ├── glowfish/          # Bioluminescent cyan glowfish sprites
        │   ├── glowfish-{stage}.svg
        │   ├── glowfish-{stage}-left.svg
        │   ├── glowfish-dead-{stage}.svg
        │   └── glowfish-dead-{stage}-left.svg
        └── shark/             # Predator shark sprites
            ├── shark.svg
            └── shark-left.svg
```

*Note: `{stage}` = baby, juvenile, adult, elder*

## How to Play

1. **Start** - Click PLAY on the menu screen
2. **Feed** - Click anywhere in the 3D tank to drop a food tablet
3. **Watch** - See your fish naturally swim and turn toward food
4. **Grow** - Fish gradually grow larger as they eat (patience pays off!)
5. **Collect** - Click glowing eggs to collect points
6. **Choose** - Select fish type when buying: Clownfish (50 pts) or Glowfish (100 pts)
7. **Expand** - Buy more fish to increase egg production
8. **Observe** - Each fish has unique personality traits affecting how they swim
9. **Survive Sharks** - When "🦈 SHARK INCOMING!" appears, brace for impact!
10. **Don't Give Up** - Keep fish alive and rebuild after shark attacks!

## Tips

### Feeding & Growth
- Feed fish near them so they can reach food quickly
- Fish need time to turn around, so drop food in front of them
- Growth is slow and gradual - be patient and keep feeding consistently
- Food is cheap (1 point) - feed often to keep fish healthy!
- Bigger fish live longer - help them grow to extend their lifespan

### Fish Strategy
- **Clownfish** are cheaper - good for building up your aquarium
- **Glowfish** have 2x egg value - great investment once you have stable income
- Adult fish are your main source of income - keep them alive!
- Elder fish produce 2x value eggs - worth growing fish to max size
- Watch your fish swim naturally - each has unique movement patterns!
- Fish have limited lifespans - plan ahead and buy new fish before elders die
- When a fish starts looking green and flips over, it's dying - time to say goodbye!

### Shark Survival
- Sharks appear every 1-3 minutes - be ready!
- When you see "🦈 SHARK INCOMING!" you have 2 seconds to prepare
- Sharks eat up to 2 fish per visit - maintain backup fish!
- Glowfish are faster (1.2x speed) - slightly better at escaping
- There's no way to stop the shark - accept some losses as part of the game
- Keep extra fish so one shark visit doesn't end your game

## Customizing Fish Sprites

The game uses SVG sprites organized by fish type in `public/assets/fish/{fishType}/`. Each stage has two versions:
- **Right-facing**: `{fishType}-{stage}.svg`
- **Left-facing**: `{fishType}-{stage}-left.svg`
- **Dead versions**: `{fishType}-dead-{stage}.svg` and `{fishType}-dead-{stage}-left.svg`

### Available Fish Types

| Type | Directory | Description |
|------|-----------|-------------|
| Clownfish | `public/assets/fish/clownfish/` | Orange with white stripes |
| Glowfish | `public/assets/fish/glowfish/` | Cyan bioluminescent glow |
| Shark | `public/assets/fish/shark/` | Gray predator (right & left only) |

### Adding a New Fish Type

1. Create a new directory: `public/assets/fish/yourfish/`

2. Create all required sprites (32 total for regular fish):
   - `yourfish-baby.svg`, `yourfish-baby-left.svg`
   - `yourfish-juvenile.svg`, `yourfish-juvenile-left.svg`
   - `yourfish-adult.svg`, `yourfish-adult-left.svg`
   - `yourfish-elder.svg`, `yourfish-elder-left.svg`
   - Plus dead versions of each

3. Add the fish type to `src/config/gameConfig.ts`:
   ```typescript
   export const FISH_TYPES: Record<FishTypeKey, FishTypeConfig> = {
     // ... existing types ...
     yourfish: {
       key: 'yourfish',
       name: 'Your Fish',
       cost: 75,
       eggValueMultiplier: 1.5,
       speedMultiplier: 1.0,
       description: 'Your custom fish',
       color: 0xff0000,
     },
   };
   ```

4. Add to preload list in `src/models/FishModel.ts`:
   ```typescript
   const FISH_TYPES_TO_PRELOAD: FishTypeKey[] = ['clownfish', 'glowfish', 'yourfish'];
   ```

### Using AI-Generated Images

You can replace sprites with AI-generated images:

1. Generate fish images using AI tools (DALL-E 3, Midjourney, Stable Diffusion)
   
2. Use prompts like:
   ```
   "Cute cartoon [fish type], side view facing right, 
   transparent background, game sprite style, vibrant colors"
   ```

3. Save as PNG with transparent background (recommended size: 200x120 pixels)

4. Update `src/models/FishModel.ts` to load `.png` instead of `.svg`:
   ```typescript
   const path = `/assets/fish/${fishType}/${fishType}-${stage}${dir}.png`;
   ```

## License

MIT
