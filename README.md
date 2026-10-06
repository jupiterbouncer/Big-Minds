# Big Minds — Interactive Interest & Pathway Explorer
> **Leadership IV Service Project** | In partnership with Crown Prince Academy, Lapaz, Ghana  
> *Ashesi University*

An interactive, non-prescriptive learning and skill discovery platform for Grade 5–6 students. Rather than asking *"What career do you want?"*, **Big Minds** asks:

> **"What are you curious about?"**

It helps young learners discover how their current curiosities connect to emerging fields without locking them into rigid career tracks:  
**Interest → Exploration → Practical Experience → Reflection → Further Exploration**.

---

## 🌟 Key Features

- **Human-Crafted Neo-Tactile UI**: Distinctive physical design with bold outlines, physical offset drop-shadows (`4px 4px 0px #0F172A`), sticker badges, and warm `#FAF8F5` canvas — intentionally crafted to look human and avoid generic AI aesthetics.
- **Privacy-Safe 2042 Life Simulation**: Explored pathways generate a future archetype card set in **2042 (16 years ahead)**. Students can customize an interactive avatar without needing webcams or photos (preserving full student privacy) and learn about inspiring real-world role models (e.g., Joy Buolamwini, Fred Swaniker, Mae Jemison, Dr. Patricia Bath, Paula Scher).
- **Classroom Kiosk Mode ("Next Student")**: Tailored for single-laptop shared use in Ghanaian classrooms. A single tap on the **"👤 Next Student"** button resets the session, map view, and localStorage cache so the next classmate can start fresh immediately.
- **Expanded Domains & Pathways (10 Interactive Nodes)**:
  - **Technology & AI**: Scratch Coding, Programming Logic, AI & Smart Systems
  - **Science & Environment**: Space & Nature Science, Clean Energy & Environment
  - **Engineering & Health**: Robotics & Hardware, Biomedical Innovation
  - **Art & Design**: Digital Graphic Design, 3D & Motion Animation
  - **Leadership & Business**: Young Entrepreneurs (budgeting & enterprise thinking)
- **Zero-Alert Interactive Micro-Activities**: Every single node features a live hands-on sandbox with real-time visual feedback (Scratch code stage, Python terminal output, AI bias training face balancer, planet size sorting challenge, obstacle sensor test, solar array angle tuner, pulse ECG simulator, palette mixer, animated FPS slider, and GHS 100 budget splitter).
- **Reinforced Curiosity Quiz**: 6 carefully designed situational questions that calculate multi-factor interest tag scores and suggest top relevant domains in 30 seconds.
- **Touch & Pointer Supported**: Canvas engine supports pointer events (mouse drag, tablet touch, stylus) and mouse wheel zooming.
- **Zero-Build & Offline Ready**: Pure vanilla JavaScript, HTML5, and Tailwind CSS. Runs completely offline from a laptop or USB drive without requiring `npm` or servers.

---

## 📁 Project Structure

```text
Big Minds/
├── index.html          # Main pathway explorer map, kiosk header & discovery drawer
├── quiz.html           # Dedicated 30s Curiosity Quiz page (mobile & desktop)
├── styles.css          # Neo-tactile styling, animations, custom sliders & stickers
├── favicon.svg         # Neo-tactile vector lightbulb favicon
├── js/
│   ├── pathwaysData.js # Domains, 10 pathway nodes, edge connections & 6-question quiz
│   ├── canvas.js       # Pan/zoom canvas engine with Bézier SVG edge routing
│   └── app.js          # BigMindsApp controller, kiosk reset, sandbox widgets & quiz logic
├── .gitignore          # Git exclusion rules
└── README.md           # Project documentation and guide
```

---

## 🚀 How to Run in the Classroom

1. **Double-click `index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari).
2. No installation, server, or internet connection is required.
3. When a student finishes their exploration, tap **"👤 Next Student"** in the top-right header to prepare the laptop for the next learner.