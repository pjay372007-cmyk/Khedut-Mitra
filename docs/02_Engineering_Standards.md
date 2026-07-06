# KrishiAI Engineering Standards (KES v1.0)

This document defines the architectural and system engineering rules for the KrishiAI codebase.

---

## 1. Architectural Philosophy

We follow **Clean Architecture** and the **SOLID Principles** to keep components modular, testable, and independent of external framework modifications.

```
┌────────────────────────────────────────────────────────┐
│                      ml_engine                         │
│   ┌────────────────────────────────────────────────┐   │
│   │               Orchestrator                     │   │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐   │   │
│   │  │ Corruption│  │ Duplicate │  │   Blur    │   │   │
│   │  │ Detector  │  │ Detector  │  │ Detector  │   │   │
│   │  └───────────┘  └───────────┘  └───────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

1.  **Single Responsibility Principle (SRP):** Each class, script, or function must have one, and only one, reason to change. Example: Do not mix image loading logic with duplicate classification algorithms.
2.  **Open-Closed Principle (OCP):** Software entities must be open for extension but closed for modification. Pipelines must allow adding new diagnostic checks by introducing new classes rather than modifying the orchestrator core.
3.  **Dependency Inversion Principle (DIP):** Depend on abstractions, not on concrete implementations. High-level orchestrators must interact with sub-modules using clear, generic interfaces.

---

## 2. Configuration-Driven Pipeline

All variables, parameters, thresholds, and file directories must be externalized. Hardcoding configurations is strictly prohibited.
*   **Default Dictionary Mapping:** Python classes must define a class-level or module-level default configuration dictionary.
*   **JSON Config Loaders:** The pipeline must support loading configurations from standard JSON files (e.g. `dataset_cleaner_config.json`), merging user values over defaults.

---

## 3. Exception Boundaries & Error Handling

System crashes and unhandled exceptions are unacceptable. Code must operate within robust error limits:
- **No Naked Try-Excepts:** Never use a blank `except:` block. Always catch specific exceptions (e.g. `IOError`, `ZeroDivisionError`) and log them.
- **Quarantine Policy over Fail-Stop:** When processing dataset files, if a single file is corrupt, blurry, or unreadable, catch the error, quarantine the file, log the warning, and continue processing the remaining images.
- **Fail-Safe UI Defaults:** If model loading fails, catch the error and present a clean explanation page with recovery instructions (e.g., advising the user to train models via python first).

---

## 4. Structured Logging Conventions

*   **No Print Statements:** Python scripts must use standard `logging` to output diagnostics. Bare `print()` statements are prohibited in production modules.
*   **Log Level Formatting:** 
    - `logger.info()` for pipeline lifecycle events (starts, completions, file saves).
    - `logger.warning()` for skipped files, fallback actions, or missing files.
    - `logger.error()` for critical pipeline failures.
*   **Log Format:**
    `[TIMESTAMP] [LOG_LEVEL] [MODULE] Message`
