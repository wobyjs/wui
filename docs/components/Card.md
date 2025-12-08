# 🧩 Card Component

The **Card** component is a flexible layout surface used to group related content and actions.  
It supports elevations, outlined and filled variants, image media, and structured footers through CardMedia, CardContent, and CardActions.

---

# 📌 Component Signature

### TSX
```tsx
<Card
    variant="elevated"
    elevation={1}
    interactive={false}
    cls=""
>
    <CardMedia />
    <CardContent>...</CardContent>
    <CardActions>...</CardActions>
</Card>
```

### Web Component
```html
<wui-card
    variant="elevated"
    elevation="1"
    interactive="false"
    cls=""
>
    <wui-card-media></wui-card-media>
    <wui-card-content></wui-card-content>
    <wui-card-actions></wui-card-actions>
</wui-card>
```

---

# ✨ Features

- Three variants: **elevated**, **outlined**, **filled**
- Elevation levels: **0–4**
- Hover-responsive **interactive mode**
- Composable API:
  - **CardMedia** – background image banner  
  - **CardContent** – padded text container  
  - **CardActions** – aligned action row  
- Fully customizable with `cls`
- Works in **TSX** and **Web Component** modes

---

# 🎨 Variants

| Variant | Description |
|--------|-------------|
| **elevated** | Paper-like surface using elevation shadow |
| **outlined** | Border-only card (no shadow) |
| **filled** | Subtle background with elevation |

---

# 🟦 Elevation Levels

| Elevation | Shadow class |
|-----------|--------------|
| **0** | `shadow-none` |
| **1** | `shadow-md` |
| **2** | `shadow-lg` |
| **3** | `shadow-xl` |
| **4** | `shadow-2xl` |

---

# 🖱️ Interactive Mode

When `interactive={true}`:

- Card becomes hover-responsive  
- Shadow increases on hover  
- Cursor switches to pointer  

Great for cards that are clickable.

---

# 🃏 Subcomponents

## 1. 🖼️ CardMedia

A flexible media region rendered as a **background image**.

### TSX
```tsx
<CardMedia
    src="/sample.png"
    alt="Example"
    height="140px"
    position="center"
    fit="cover"
    cls="rounded-xl"
/>
```

### HTML
```html
<wui-card-media
    src="/sample.png"
    alt="Example"
    height="140px"
    position="center"
    fit="cover"
    cls="rounded-xl"
></wui-card-media>
```

---

## 2. 📄 CardContent

Container for padded content.

### TSX
```tsx
<CardContent padding="p-6">
    <h3>Title</h3>
    <p>Description...</p>
</CardContent>
```

### HTML
```html
<wui-card-content padding="p-6">
    <h3>Title</h3>
    <p>Description...</p>
</wui-card-content>
```

`padding="p-4"` is the default.

---

## 3. 🔘 CardActions

Footer row for buttons and controls.

Supports horizontal alignment:

| align | Behavior |
|--------|-----------|
| **start** | left-aligned |
| **center** | centered |
| **end** | right-aligned |
| **between** | space-between |

### TSX
```tsx
<CardActions align="center" padding="p-3">
    <Button>OK</Button>
</CardActions>
```

### HTML
```html
<wui-card-actions align="center" padding="p-3">
    <wui-button>OK</wui-button>
</wui-card-actions>
```

---

# 🧩 Example — Profile Card

```tsx
<Card cls="max-w-sm m-2">
    <CardMedia
        src="/sample-avatar.png"
        alt="Avatar"
        cls="w-24 h-24 rounded-full mx-auto mt-4 bg-cover"
    />
    <CardContent cls="px-5 pb-4">
        <h3 class="text-lg font-semibold text-center">Taylor</h3>
        <p class="text-sm text-gray-600 mt-1 text-justify">
            Front-end engineer focused on accessible components.
        </p>
    </CardContent>
    <CardActions align="center" padding="p-3">
        <Button cls="px-4 py-2 rounded">Say Hi</Button>
    </CardActions>
</Card>
```

### HTML equivalent
```html
<wui-card cls="max-w-sm m-2">
    <wui-card-media src="/sample-avatar.png"></wui-card-media>
    <wui-card-content cls="px-5 pb-4">...</wui-card-content>
    <wui-card-actions align="center" padding="p-3">
        <wui-button cls="px-4 py-2 rounded">Say Hi</wui-button>
    </wui-card-actions>
</wui-card>
```

---

# 📝 Best Practices

- Use **outlined** for low-emphasis containers  
- Use **filled** for subtle emphasis sections  
- Use **elevated** for prominent surfaces  
- Enable **interactive** for clickable cards  
- Keep spacing consistent using `padding` on CardContent  
- Align actions using CardActions for visual consistency  

---

# 🧠 Notes

- Card always renders a `<div>` wrapper  
- Variant + elevation + interactive styles are composable  
- `cls` merges last, providing full control over overrides  
- Web Component versions behave identically to TSX equivalents  