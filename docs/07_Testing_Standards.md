# KrishiAI Testing Standards (KES v1.0)

This document establishes the testing mandates for Python pipelines and JavaScript frontend engines.

---

## 1. Python Unit Testing Mandates

All Python modules, pipelines, and dataset managers must be accompanied by comprehensive tests under the `/tests/` directory:

-   **Testing Framework:** Standard Python `unittest` libraries are required.
-   **Isolation & Sandboxing:** Tests must not rely on real user datasets. They must programmatically generate mock images or directories on-the-fly inside the setup stages.
-   **Temporary Directory Cleanup:** Test files must reside inside dynamic, isolated folders (e.g. `tests/temp_test_data/`). The `tearDown()` method must invoke `shutil.rmtree()` to cleanly delete all test folders, leaving the workspace completely clean after completion.
-   **Test Coverage Rules:**
    - Test individual validation units (e.g. assert that corruption detector catches corrupt text bytes).
    - Test edge cases (e.g. solid grey image variance checks).
    - Test full pipeline orchestrations (from raw folder input to report outputs).
-   **Running Command:**
    `python -m unittest tests/test_dataset_cleaner.py`

---

## 2. Mock Image Generation (Standard Helper Pattern)

Test scripts should generate checkerboard arrays or gradient lines to test image-processing models:

```python
# Standard pattern for creating high-contrast test image
img = Image.new("RGB", (200, 200), color="white")
draw = ImageDraw.Draw(img)
for i in range(0, 200, 10):
    draw.line([(i, 0), (i, 200)], fill="black", width=2)
```

---

## 3. Frontend Validation Guidelines

JavaScript files (`aiAgent.js` and `app.js`) must be validated to ensure DOM stability and correct API structures:

-   **TF.js Model Load Mock:** If TensorFlow.js weights are missing from the folder, the script must throw a cleanly caught error (`LOCAL_MODEL_NOT_FOUND`) and present recovery elements, rather than triggering a console error.
-   **No UI Breakage:** Refactoring Javascript scripts must preserve all navigation nodes, Mandi dashboards, settings UI widgets, and language selectors.
-   **Console Checks:** Run local python web server and check browser console. Ensure no syntax errors or unresolved promises remain.
