# Avlok Ai

A sleek, modern file uploader with an interactive DNA/spider-web background animation.

![Light Mode](https://img.shields.io/badge/Theme-Light-blue) ![Dark Mode](https://img.shields.io/badge/Theme-Dark-black)

## ✨ Features

### File Upload
- Drag & drop file upload interface
- Click to browse files
- Real-time upload progress with animated loading bar
- Light and dark theme support

### Interactive Background Animation
- **DNA/Spider-web aesthetic** - Organic network of interconnected nodes with curved, flowing connections
- **Mouse-responsive** - The web reacts to cursor movement in real-time
- **Cursor attachment system**:
  - Strings attach to and follow the cursor
  - After 5 seconds of attachment, nodes slowly turn red with a glowing effect
  - Fully heated nodes burst outward smoothly
  - Cursor repels nodes for 20 seconds cooldown period
- **Touch support** - Works on mobile devices with finger interaction
- **Performance optimized** - Reduced node density on mobile for smooth animation

### Responsive Design
- Fully mobile-friendly
- Optimized layouts for tablets, phones, and landscape mode
- Touch-friendly tap targets
- Adapts to all screen sizes (360px+)

## 🚀 Getting Started

### Quick Start
Simply open `index.html` in your browser:

```bash
# Double-click index.html or use a local server:
python -m http.server 3000
# Then visit http://localhost:3000
```

### Project Structure

```
Week_1/
├── index.html      # Main HTML structure
├── styles.css      # Styling with responsive breakpoints
├── script.js       # File upload logic
├── background.js   # Interactive canvas animation
└── README.md       # This file
```

## 🎨 Themes

Toggle between themes using the button in the header:

| Theme | Background | Accent |
|-------|------------|--------|
| Light | Light blue ocean tint | Blue (#3B82F6) |
| Dark  | Pure black | White (#E5E5E5) |

## 🖱️ Interactive Effects

1. **Hover** - Nodes and connections glow brighter near the cursor
2. **Stay Still** - Keep cursor still for 5 seconds to trigger the heat effect
3. **Burst** - Watch nodes turn red and explode outward
4. **Cooldown** - Cursor repels nodes for 20 seconds after burst

## 📱 Mobile Support

- Touch events for background interaction
- Responsive layout adjustments
- Optimized animation performance
- No hover effects (uses tap feedback instead)

## 🛠️ Technologies

- **HTML5** - Semantic structure
- **CSS3** - Custom properties, animations, media queries
- **JavaScript** - Canvas API, touch events, animation loops
- **Google Fonts** - Inter typeface

## 📄 License

MIT License - Feel free to use and modify.

---

*Powered by Avlok Ai*
