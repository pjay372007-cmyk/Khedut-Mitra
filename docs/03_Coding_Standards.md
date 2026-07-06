# KrishiAI Coding Standards (KCS v1.0)

This document establishes the styling, naming conventions, syntax rules, and standards for Python, JavaScript, and HTML/CSS within the KrishiAI repository.

---

## 1. Python Code Guidelines

All Python code must follow **PEP 8** style guidelines:

### A. Type Hints (Strictly Required)
All functions and methods must contain explicit parameter and return type hints:
```python
def process_data(file_path: str, threshold: float = 100.0) -> bool:
```

### B. Google Style Docstrings (Strictly Required)
Every module, class, and public function must have docstrings describing inputs, outputs, and behaviors:
```python
def calculate_dhash(image: Image.Image) -> Optional[str]:
    """
    Computes perceptual difference hash (dHash) for finding duplicates.

    Args:
        image: A Pillow image object.

    Returns:
        A hexadecimal string representation of the hash, or None if computation fails.
    """
```

### C. Style & Formatting
- **Indentation:** Use 4 spaces per indentation level.
- **Line Length:** Wrap lines to a maximum of 100 characters.
- **Naming Conventions:**
  - Class names: `PascalCase` (e.g. `DuplicateDetector`).
  - Variables, functions, and modules: `snake_case` (e.g. `calculate_sha256`).
  - Constants: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_THRESHOLD`).

---

## 2. JavaScript Guidelines

All frontend JavaScript must conform to clean ES6+ practices:

- **Modular Objects:** Structure scripts as clean, encapsulated objects (e.g. `const cropAI = { ... }`).
- **Zero Global Variable Pollution:** Do not declare variables directly on the global window scope. Declare configs and constants inside module scopes.
- **Safe DOM Manipulation:** Always check if elements exist before reading/writing properties:
  ```javascript
  const badge = document.getElementById('ai-urgency-badge');
  if (badge) {
    badge.textContent = us.label;
  }
  ```
- **Script Caching and Lifecycle:** Cache loaded models in memory (`this.cropModel`) to avoid repetitive disk loads. Clean up event listeners or interval timers when switching panels.

---

## 3. HTML & CSS Guidelines

- **Semantic Tags:** Use HTML5 semantic layout wrappers (`<header>`, `<section>`, `<main>`, `<footer>`).
- **Unique Selector IDs:** All buttons, panels, cards, inputs, and text fields must have unique, descriptive IDs (e.g. `ai-analyse-btn`, `ai-img-preview`) to facilitate automated UI and browser testing.
- **Aesthetic Excellence:**
  - Font Stack: Standardized on premium **Outfit** and **Inter** sans-serif font families loaded via Google Fonts.
  - Colors: Use clean CSS custom properties (variables) representing a premium palette:
    ```css
    :root {
      --primary: #0f7d3e;     /* Deep foliage green */
      --secondary: #16a34a;   /* Fresh leaf green */
      --bg-dark: #090f0c;     /* Dark carbon bg */
      --glass-panel: rgba(255, 255, 255, 0.08);
      --radius-lg: 16px;
    }
    ```
  - Responsive Layouts: Use Flexbox and Grid layouts. The interface must adapt cleanly across standard mobile views (360px) and wide desktop displays.
