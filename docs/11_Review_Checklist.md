# KrishiAI Pull Request Code Review Checklist (KES v1.0)

This checklist must be reviewed and checked off by engineers or automated lint systems before merging any branch into main.

---

## 1. Architectural Alignment

*   [ ] **SOLID Principles:** Does the implementation follow Single Responsibility (SRP), Open-Closed (OCP), and Dependency Inversion (DIP)? Are detectors/utilities isolated?
*   [ ] **Folder Structure:** Are new files saved in the correct directories (static JSON in `data/`, training scripts in `ml_engine/`, converters in `ml_engine/export/`)?
*   [ ] **No Fake/Placeholder Predictions:** Does the offline engine run real pixel-level convolutions via TF.js rather than simulated arrays or sequential indexes?

---

## 2. Code Quality & Standards

*   [ ] **Type Hints:** Do all new Python functions and methods contain parameter and return type declarations?
*   [ ] **Docstrings:** Do all Python modules, classes, and public methods contain Google/Sphinx style docstrings detailing Args and Returns?
*   [ ] **Logging:** Are there zero `print()` statements in Python production code? Is logging configured cleanly?
*   [ ] **Error Boundaries:** Are exceptions caught with specific error clauses? Does the orchestrator pipeline quarantine files and log errors rather than crashing on bad inputs?

---

## 3. Testing & Coverage

*   [ ] **Unit Tests:** Are there unit tests created for the new features?
*   [ ] **Sandbox Isolation:** Do the tests avoid loading real user datasets and programmatically generate mock images/dirs instead?
*   [ ] **Teardown Cleanup:** Does the `tearDown()` script cleanly remove all temporary test directories and files?

---

## 4. UI & Aesthetics Preservation

*   [ ] **Style Preservation:** Does the change keep CSS, HTML variables, margins, Outfit fonts, and responsive grid layouts untouched unless explicitly required?
*   [ ] **Bilingual Integrity:** Does the scanner result toggle support both English and Gujarati inputs dynamically?
*   [ ] **Element ID Safety:** Are DOM manipulation target selectors verified to prevent JavaScript crashes on non-existing elements?
