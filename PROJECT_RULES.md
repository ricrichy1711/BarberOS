# Project Rules & Guidelines

## 1. Code Modification Rules
- **Focused Edits**: Do NOT modify unrelated parts of the code. Only touch the specific sections or files requested by the user or necessary for the current task.
- **Preserve Existing Logic**: Unless explicitly asked to refactor, keep existing business logic intact.
- **No "Placeholder" Logic**: Do not remove working code to replace it with "simpler" versions unless requested.

## 2. Design & Aesthetics
- **Premium Look**: Maintain the "premium" feel with dark modes, gradients, and specific color palettes.
- **Consistency**: The design must be consistent across dashboards but respected for role-specific colors.

## 3. Role-Based Color Scheme
- **Owner**: **Emerald / Green** (`emerald-500`, `emerald-400`, `green-600`)
- **Barber**: **Blue** (`blue-500`, `blue-400`, `blue-600`)
- **Client**: **Amber / Gold** (`amber-500`, `amber-400`, `orange-500`)

## 4. Icon Standardization
Ensure consistency in icons across all dashboards for similar tabs:
- **Resumen / Overview**: `LayoutDashboard` (from `lucide-react`)
- **Citas / Appointments**: `Calendar`
- **Mensajes / Messages**: `MessageSquare`
- **Perfil / Profile**: `User`
- **Configuración / Settings**: `Settings`
- **Barberos / Staff**: `Users`
- **Agendar / Book**: `Plus`

## 5. Dashboard Layout
- **Sidebar**: Fixed on the left.
- **Content**: Main content area on the right with a margin `ml-64`.
- **Cards**: Use rounded-2xl, border-zinc-800, `bg-zinc-900/50`.

## 6. Language
- **Spanish**: All UI text must be in Spanish.
