# Thalamus Graph Format

Generate JSON diagrams for Thalamus. Keep it simple - use basic nodes and edges only.

## Output Structure

```json
{
  "title": "Your Title",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [],
  "edges": [],
  "version": 2
}
```

## Nodes

Use `type: "editable"` for all content nodes. The `kind` controls the default color/shape.

```json
{
  "id": "unique-id",
  "type": "editable",
  "position": { "x": 0, "y": 0 },
  "data": {
    "label": "Title",
    "body": "Optional description",
    "kind": "idea",
    "sourceHandles": [{ "id": "source" }],
    "targetHandles": [{ "id": "target" }]
  }
}
```

### Node Kinds

| kind       | use for              | color            | shape   |
| ---------- | -------------------- | ---------------- | ------- |
| `idea`     | general concepts     | gray `#E2E8F0`   | rounded |
| `question` | unknowns, risks      | yellow `#FDE68A` | circle  |
| `evidence` | facts, data          | green `#BBF7D0`  | rounded |
| `goal`     | objectives, outcomes | blue `#BFDBFE`   | pill    |

### Text Labels (no connections)

```json
{
  "id": "label-1",
  "type": "text",
  "position": { "x": 0, "y": 0 },
  "data": {
    "label": "Section Title",
    "kind": "text"
  }
}
```

## Edges

Connect nodes using their IDs. Always use `"source"` and `"target"` for handles.

```json
{
  "id": "node1-node2",
  "source": "node1",
  "target": "node2",
  "sourceHandle": "source",
  "targetHandle": "target",
  "label": "optional label",
  "data": {
    "style": {
      "color": "#64748b",
      "thickness": 2,
      "curvature": "smoothstep",
      "lineStyle": "solid",
      "markerEnd": "arrowclosed"
    }
  }
}
```

### Edge Styles

- `curvature`: `"smoothstep"` (default), `"bezier"`, `"straight"`
- `lineStyle`: `"solid"`, `"dashed"`
- `markerEnd`: `"arrowclosed"` (filled arrow), `"arrow"` (open), `"none"`

## Positioning

- Space nodes **200px apart horizontally**, **120px apart vertically**
- Align to grid (multiples of 24)
- Flow left-to-right or top-to-bottom

## Complete Example

```json
{
  "title": "User Authentication Flow",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "nodes": [
    {
      "id": "user",
      "type": "editable",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "User",
        "body": "Enters credentials",
        "kind": "idea",
        "sourceHandles": [{ "id": "source" }],
        "targetHandles": [{ "id": "target" }]
      }
    },
    {
      "id": "auth-api",
      "type": "editable",
      "position": { "x": 240, "y": 0 },
      "data": {
        "label": "Auth API",
        "body": "POST /login",
        "kind": "idea",
        "sourceHandles": [{ "id": "source" }],
        "targetHandles": [{ "id": "target" }]
      }
    },
    {
      "id": "database",
      "type": "editable",
      "position": { "x": 480, "y": 0 },
      "data": {
        "label": "Database",
        "body": "Verify credentials",
        "kind": "idea",
        "sourceHandles": [{ "id": "source" }],
        "targetHandles": [{ "id": "target" }]
      }
    },
    {
      "id": "success",
      "type": "editable",
      "position": { "x": 720, "y": -60 },
      "data": {
        "label": "Success",
        "body": "Return JWT token",
        "kind": "goal",
        "sourceHandles": [{ "id": "source" }],
        "targetHandles": [{ "id": "target" }]
      }
    },
    {
      "id": "failure",
      "type": "editable",
      "position": { "x": 720, "y": 60 },
      "data": {
        "label": "Failure",
        "body": "Invalid credentials",
        "kind": "question",
        "sourceHandles": [{ "id": "source" }],
        "targetHandles": [{ "id": "target" }]
      }
    }
  ],
  "edges": [
    {
      "id": "user-auth",
      "source": "user",
      "target": "auth-api",
      "sourceHandle": "source",
      "targetHandle": "target",
      "label": "login request",
      "data": {
        "style": {
          "color": "#64748b",
          "thickness": 2,
          "curvature": "smoothstep",
          "lineStyle": "solid",
          "markerEnd": "arrowclosed"
        }
      }
    },
    {
      "id": "auth-db",
      "source": "auth-api",
      "target": "database",
      "sourceHandle": "source",
      "targetHandle": "target",
      "label": "query",
      "data": {
        "style": {
          "color": "#64748b",
          "thickness": 2,
          "curvature": "smoothstep",
          "lineStyle": "solid",
          "markerEnd": "arrowclosed"
        }
      }
    },
    {
      "id": "db-success",
      "source": "database",
      "target": "success",
      "sourceHandle": "source",
      "targetHandle": "target",
      "label": "valid",
      "data": {
        "style": {
          "color": "#22c55e",
          "thickness": 2,
          "curvature": "smoothstep",
          "lineStyle": "solid",
          "markerEnd": "arrowclosed"
        }
      }
    },
    {
      "id": "db-failure",
      "source": "database",
      "target": "failure",
      "sourceHandle": "source",
      "targetHandle": "target",
      "label": "invalid",
      "data": {
        "style": {
          "color": "#ef4444",
          "thickness": 2,
          "curvature": "smoothstep",
          "lineStyle": "dashed",
          "markerEnd": "arrowclosed"
        }
      }
    }
  ],
  "version": 2
}
```

## Rules

1. **Always include `sourceHandles` and `targetHandles`** in node data
2. **Always use `"source"` and `"target"`** as handle IDs
3. **Use unique IDs** for all nodes and edges
4. **Position nodes on a grid** - use multiples of 24
5. **Keep labels short** - 1-3 words for edges, short titles for nodes
