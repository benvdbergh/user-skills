---
name: low-poly-gen-mcp
description: >-
  Orchestrate the low-poly-gen MCP to create/edit low-poly assets, compose scenes, and export PNG renders. Use when you need to call low-poly-gen tools like create_object, edit_object, list_objects, save_object, load_object, create_scene, add_instance, remove_instance, save_scene, load_scene, or export_png; and when you want a safe, repeatable workflow for building low-poly objects and scenes for vision-in-the-loop.
license: MIT
metadata:
  author: PAI
  version: 1.0.1
  mcp-server-name: low-poly-gen
  mcp-server-identifier: project-0-low-poly-gen-low-poly-gen
---

# low-poly-gen-mcp

This skill provides a correct-by-construction workflow for using the `low-poly-gen` MCP as specified in `specs/spec.md`: create procedural low-poly assets, manage an asset library, compose scenes, and export PNG renders for feedback.



## MCP Dependencies

- **Server**: `project-0-low-poly-gen-low-poly-gen` (server name: `low-poly-gen`)
- **Primary Tools**:
  - `low_poly_ping`
  - `create_object`, `edit_object`, `duplicate_object`, `list_objects`, `load_object`, `save_object`, `delete_object`
  - `create_scene`, `add_instance`, `remove_instance`, `load_scene`, `save_scene`
  - `export_png`

## Tool Usage Mapping

| Workflow Step | MCP Tool | Purpose | Safety Level |
|--------------|----------|---------|--------------|
| Verify MCP available | `low_poly_ping` | Confirm server responds before doing work | Safe |
| Discover existing assets | `list_objects` | Avoid duplicates; find reusable assets | Safe |
| Create new asset | `create_object` | Create primitives or templates (vehicle/simple_building) | Safe |
| Modify existing asset | `edit_object` | Apply geometry/material changes by id | Safe |
| Clone an asset | `duplicate_object` | Create a variant without editing original | Safe |
| Persist an asset | `save_object` | Write asset JSON to storage | Safe |
| Load an asset | `load_object` | Bring an asset from file or state id into state | Safe |
| Remove an asset from state | `delete_object` | Delete from runtime state | Requires Confirmation |
| Delete an asset file | `delete_object` with `deleteFile: true` | Destructive remove from storage | Requires Confirmation |
| Create a scene | `create_scene` | Start a new composition | Safe |
| Add an instance | `add_instance` | Place asset instance with transforms | Safe |
| Remove an instance | `remove_instance` | Remove by instance_id | Requires Confirmation |
| Save current scene | `save_scene` | Persist to storage | Safe |
| Load a scene | `load_scene` | Replace current scene from file | Requires Confirmation |
| Render to PNG | `export_png` | Produce image for feedback loop | Safe |

## Tool Safety Policy

- **Safe Operations** (run automatically):
  - `low_poly_ping`
  - `list_objects`
  - `create_object`, `edit_object`, `duplicate_object`
  - `load_object`, `save_object`
  - `create_scene`, `add_instance`, `save_scene`
  - `export_png`
- **Requires Confirmation** (ask before running, because it deletes or replaces state/storage):
  - `delete_object` (always)
  - `delete_object` with `deleteFile: true` (always, most destructive)
  - `remove_instance`
  - `load_scene` (replaces current scene)
- **Never Allowed** (block):
  - Passing additional undeclared arguments to any tool (all schemas set `additionalProperties: false`)
  - Calling `export_png` with `width` or `height` above 4096

## Streamlined Usage Patterns

### Single-object flow (Object Workbench)

Use this when the user wants **one asset visible in the Object Workbench** (assuming storage is configured and the workbench watches `assets/`):

1. **Preflight**
   - `low_poly_ping` (optional) to confirm server is reachable.
2. **Create or reuse an asset**
   - Prefer **styles with defaults** over heavy custom `params` to stay within validation rules (face count, palette, allowed primitives).
   - To create a new asset that should appear in the workbench:
     - `create_object(type: "...", style: "...", saveToFile: true)`
   - To reuse an existing asset:
     - `list_objects` (optionally with `filter`) and surface existing ids/paths instead of creating duplicates.
3. **Surface to the user**
   - Refer to the asset by **id** and, when relevant, by its persisted **path** under `assets/...` so the user can find it in the workbench browser or JSON viewer.

### Quick scene flow (Object Workbench + scene preview)

Use this when the user asks for a **small composition** (e.g. “a tree next to a house”):

1. **Ensure base assets exist**
   - For each required asset, either:
     - Create with `create_object(..., saveToFile: true)`; or
     - Reuse via `list_objects` if something similar already exists.
2. **Create a scene**
   - `create_scene(scene_id: "<descriptive-id>")`
3. **Place instances**
   - For each asset, call `add_instance` with:
     - `asset_id` from the previous step
     - `position` `{x,y,z}` chosen to make a readable composition
     - Optional `rotation` / `scale` to adjust proportions
4. **Render for feedback**
   - `export_png(width, height, camera_config?)` to give the user a quick visual of the scene.
   - Optionally `save_scene()` when a stable composition is desired.

## Operating Workflow

### 1) Preflight and discovery

- Call `low_poly_ping` (optionally with an echo message) to verify connectivity.
- Call `list_objects` first, optionally with a `filter`, to reuse assets and avoid duplication.

### 2) Asset workflow (Object Workbench)

- Prefer creating compositional templates when available:
  - `create_object` with `type: "vehicle"` for cars/trucks-like assets.
  - `create_object` with `type: "simple_building"` for basic buildings.
- Otherwise use primitives:
  - `create_object` with `type: "box" | "cylinder" | "cone" | "sphere"`.
- Use `edit_object` to adjust an existing asset. If you need a variant without changing the original, use `duplicate_object` then `edit_object` on the new id.
- If you need persistence, either:
  - set `saveToFile: true` during `create_object` or `edit_object`, or
  - call `save_object` with `id` (and optional `pathOrCategory`).

### 3) Scene workflow (Scene Creator)

- `create_scene` with a stable `scene_id` for the composition.
- Place assets with `add_instance`:
  - Always provide `position` with `{x,y,z}`.
  - Optionally provide `rotation` and `scale` (same `{x,y,z}` shape).
- Persist with `save_scene` (optionally providing `scene_id`, otherwise it uses the current scene id).
- Remove objects from the scene using `remove_instance` only when confirmed.

### 4) Rendering and vision-in-the-loop

- Use `export_png` with explicit `width` and `height`.
- Provide `camera_config` only when you need a deterministic view:
  - `camera_config.position` and `camera_config.target` both require `{x,y,z}`.

### 5) Object Workbench visibility (assumes working storage)

- Ensure the MCP server is started with **file storage configured** and a valid `STORAGE_ROOT`.
- Use `saveToFile: true` or `save_object` so assets are written under `assets/...`.
- When the user reports that a created asset is not visible in the workbench:
  - First, prefer checking for the asset via `list_objects`.
  - Then confirm that the expected JSON file path under `assets/` exists (implementation detail) and that the workbench is configured to scan that location.

## Parameter Cheat Sheet (schema-grounded)

- `create_object`:
  - Required: `type` in `{box,cylinder,cone,sphere,vehicle,simple_building}`
  - Optional: `style` (string), `params` (object), `saveToFile` (boolean)
- `edit_object`:
  - Required: `id` (string), `modifications` (object)
  - Optional: `saveToFile` (boolean)
- `list_objects`:
  - Optional: `filter` with `type` and/or `category`
- `load_object`:
  - Required: `pathOrId` (string)
- `save_object`:
  - Required: `id` (string)
  - Optional: `pathOrCategory` (string)
- `delete_object`:
  - Required: `id` (string)
  - Optional: `deleteFile` (boolean)
- `create_scene`:
  - Required: `scene_id` (string)
- `add_instance`:
  - Required: `asset_id` (string), `position` `{x,y,z}`
  - Optional: `rotation` `{x,y,z}`, `scale` `{x,y,z}`
- `remove_instance`:
  - Required: `instance_id` (string)
- `load_scene`:
  - Required: `scene_id` (string)
- `save_scene`:
  - Optional: `scene_id` (string)
- `export_png`:
  - Required: `width` (int 1..4096), `height` (int 1..4096)
  - Optional: `camera_config.position` and `camera_config.target` as `{x,y,z}`

## Examples

**Example 1: Create a reusable asset**
```
User: "Create a small yellow car and save it under assets/vehicles."
→ low_poly_ping
→ list_objects(filter: { category: "vehicles" })
→ create_object(type: "vehicle", params: { size: "small", color: "yellow" }, saveToFile: true)
→ save_object(id: "<returned id>", pathOrCategory: "vehicles")
```

**Example 2: Compose a scene and export a render**
```
User: "Put the car on a driveway next to a simple house and export a 1024x1024 PNG."
→ create_scene(scene_id: "driveway-house-v1")
→ add_instance(asset_id: "<car id>", position: {x: 0, y: 0, z: 0})
→ create_object(type: "simple_building", params: { style: "suburban" }, saveToFile: true)
→ add_instance(asset_id: "<house id>", position: {x: 3, y: 0, z: -2})
→ save_scene()
→ export_png(width: 1024, height: 1024, camera_config: { position: {x: 6, y: 5, z: 8}, target: {x: 1, y: 0, z: -1} })
```

**Example 3: Safely delete an asset**
```
User: "Delete the old car asset file too."
→ Confirm destructive action
→ delete_object(id: "<car id>", deleteFile: true)
```
