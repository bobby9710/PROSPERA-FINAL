# Anti-Patterns to Avoid: Prospera Squad

## Product Management
- Prioritizing "cool" features over core compliance or security.
- Setting vague goals without measurable KPIs.
- Ignoring technical debt for too many sprints.

## UI/UX Design
- Using pure black (#000) for dark mode backgrounds.
- Designing static layouts that break on small mobile screens.
- Overloading the dashboard with too many charts (Information Overload).

## Development
- Hardcoding colors/fonts instead of using the Design System variables.
- Direct database mutations without proper validation or error handling.
- Spawning too many re-renders in the Dashboard.

## QA & DevOps
- Manual-only testing for critical financial flows.
- Ignoring console errors or lint warnings in production.
- Deploying without checking visual regressions on mobile.
