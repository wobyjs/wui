/* Probe: capture actual renderToString output for each wui component.
   Run: pnpm exec tsx src/ssr/probe.tsx
   Output is printed so exact expected strings can be copied into TestXxx.tsx. */
import { renderToString, type JSX } from 'woby'
import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card, CardMedia, CardContent, CardActions } from '../Card'
import { Checkbox } from '../Checkbox'
import { Fab } from '../Fab'
import { Chip } from '../Chip'
import { Collapse } from '../Collapse'
import { IconButton } from '../IconButton'
import { Paper } from '../Paper'
import { ToggleButton } from '../ToggleButton'
import { Toolbar } from '../Toolbar'

const render = (label: string, el: JSX.Element) => {
    console.log(`--- ${label} ---`)
    console.log(renderToString(() => el))
    console.log('')
}

// Avatar
render('Avatar[0] xs/circular/alt=A', <Avatar size="xs" type="circular" src="" alt="A" />)
render('Avatar[1] sm/rounded/src=x.png', <Avatar size="sm" type="rounded" src="x.png" alt="Avatar" />)
render('Avatar[2] md/square/alt=B', <Avatar size="md" type="square" src="" alt="B" />)
render('Avatar[3] lg/circular/src=y.png', <Avatar size="lg" type="circular" src="y.png" alt="User" />)

// Badge
render('Badge[0] top/right content=4', <Badge badgeContent="4"><span>Hi</span></Badge>)
render('Badge[1] bottom/left content=New', <Badge badgeContent="New" vertical="bottom" horizontal="left"><span>X</span></Badge>)
render('Badge[2] empty content', <Badge><span>Y</span></Badge>)

// Button
render('Button[0] contained', <Button type="contained">Contained</Button>)
render('Button[1] outlined', <Button type="outlined">Outlined</Button>)
render('Button[2] text', <Button type="text">Text</Button>)
render('Button[3] disabled', <Button type="contained" disabled>Disabled</Button>)

// Card (with subcomponents)
render('Card[0] elevated', <Card variant="elevated" elevation={1}><CardContent padding="p-4">Body</CardContent></Card>)
render('Card[1] outlined', <Card variant="outlined"><CardActions align="end" padding="p-2">Act</CardActions></Card>)
render('Card[2] filled', <Card variant="filled" elevation={2}><CardMedia src="i.png" alt="Img" height="100px" /></Card>)

// Checkbox (with fixed IDs)
render('Checkbox[0] id=test-cb-0', <Checkbox id="test-cb-0">Remember</Checkbox>)
render('Checkbox[1] id=test-cb-1', <Checkbox labelPosition="right" id="test-cb-1">Agree</Checkbox>)
render('Checkbox[2] id=test-cb-2', <Checkbox labelPosition="top" checked id="test-cb-2">On</Checkbox>)

// Fab
render('Fab[0] pill', <Fab type="pill">+</Fab>)
render('Fab[1] circular', <Fab type="circular">★</Fab>)

// Chip
render('Chip[0] default', <Chip>Label</Chip>)
render('Chip[1] deletable', <Chip deletable>Label</Chip>)

// Collapse
render('Collapse[0] open', <Collapse>Content</Collapse>)
render('Collapse[1] closed', <Collapse open={false}>Content</Collapse>)
render('Collapse[2] bg', <Collapse background>Content</Collapse>)

// IconButton
render('IconButton[0] enabled', <IconButton>★</IconButton>)
render('IconButton[1] disabled', <IconButton disabled>X</IconButton>)

// Paper
render('Paper[0] elevation=0', <Paper elevation={0}>Content</Paper>)
render('Paper[1] elevation=1', <Paper>Content</Paper>)
render('Paper[2] elevation=3', <Paper elevation={3}>Content</Paper>)

// ToggleButton
render('ToggleButton[0] unchecked', <ToggleButton>Bold</ToggleButton>)
render('ToggleButton[1] checked', <ToggleButton checked>Bold</ToggleButton>)

// Toolbar
render('Toolbar[0] default', <Toolbar>Item</Toolbar>)
