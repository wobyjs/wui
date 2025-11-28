import { Toolbar } from '../src/Toolbar'
import { Button } from '../src/Button'


// // Default Toolbar Example
const DefaultToolbar = () => {
    return (
        <Toolbar>
            <div class="flex items-center justify-between w-full">
                <div class="text-lg font-bold">App Title</div>
                <div class="flex space-x-2">
                    <Button type="outlined" cls="px-3 py-1 bg-gray-200 rounded">Menu</Button>
                    <Button type="outlined" cls="px-3 py-1 bg-gray-200 rounded">Settings</Button>
                </div>
            </div>
        </Toolbar>
    )
}

// Toolbar with Custom Styling
const StyledToolbar = () => {
    return (
        <Toolbar cls="bg-blue-600 text-white shadow-lg">
            <div class="flex items-center justify-between w-full">
                <div class="text-xl font-bold">My Application</div>
                <div class="flex space-x-4 py-4 px-2">
                    <Button type="outlined" cls="px-4 py-2 hover:bg-blue-700 rounded text-white !border-white">Home</Button>
                    <Button type="outlined" cls="px-4 py-2 hover:bg-blue-700 rounded text-white !border-white">Profile</Button>
                    <Button type="outlined" cls="px-4 py-2 hover:bg-blue-700 rounded text-white !border-white">Settings</Button>
                </div>
            </div>
        </Toolbar>
    )
}

// Toolbar with Icons
const IconToolbar = () => {
    return (
        <Toolbar cls="bg-gray-800 text-white">
            <div class="flex items-center space-x-4">
                <button class="p-2 hover:bg-gray-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </button>
                <button class="p-2 hover:bg-gray-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
                <button class="p-2 hover:bg-gray-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </Toolbar>
    )
}

// Toolbar with Navigation
const NavigationToolbar = () => {
    return (
        <Toolbar cls="bg-white border-b border-gray-200">
            <div class="flex items-center justify-between w-full">
                <div class="flex space-x-8">
                    <a href="#" class="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">Dashboard</a>
                    <a href="#" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Team</a>
                    <a href="#" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Projects</a>
                    <a href="#" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Calendar</a>
                </div>
                <div>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded">New Item</button>
                </div>
            </div>
        </Toolbar>
    )
}

// Compact Toolbar
const CompactToolbar = () => {
    return (
        <Toolbar cls="bg-gray-100 p-2">
            <div class="flex items-center justify-between">
                <div class="text-sm font-medium">Document Editor</div>
                <div class="flex space-x-1 px-2">
                    <Button type="outlined" cls="!px-2 !py-1 text-black border-white text-xs bg-white border rounded">Save</Button>
                    <Button type="outlined" cls="!px-2 !py-1 text-black border-white text-xs bg-white border rounded">Undo</Button>
                    <Button type="outlined" cls="!px-2 !py-1 text-black border-white text-xs bg-white border rounded">Redo</Button>
                </div>
            </div>
        </Toolbar>
    )
}

export {
    DefaultToolbar,
    StyledToolbar,
    IconToolbar,
    NavigationToolbar,
    CompactToolbar,
}