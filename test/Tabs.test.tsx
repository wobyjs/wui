import { Tabs, Tab } from '../src/Tabs'
import { $, $$ } from 'woby'

// Basic Tabs Example
const BasicTabsExample = () => {
    return (
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Basic Tabs</h2>
            <Tabs>
                <Tab title="Home">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">Welcome Home</h3>
                        <p>This is the home tab content.</p>
                    </div>
                </Tab>
                <Tab title="Profile">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">User Profile</h3>
                        <p>This is the profile tab content.</p>
                    </div>
                </Tab>
                <Tab title="Settings">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">Settings</h3>
                        <p>This is the settings tab content.</p>
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}

// Tabs with Observable Active Tab
const ObservableTabsExample = () => {
    const activeTab = $("Home")

    return (
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Tabs with Observable Active Tab</h2>
            <div class="mb-4">
                <p class="mb-2">Current active tab: <strong>{activeTab}</strong></p>
                <button 
                    class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => activeTab("Profile")}
                >
                    Go to Profile
                </button>
                <button 
                    class="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => activeTab("Settings")}
                >
                    Go to Settings
                </button>
            </div>
            <Tabs activeTag={activeTab}>
                <Tab title="Home">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">Home Content</h3>
                        <p>You can control this tab programmatically using the buttons above.</p>
                    </div>
                </Tab>
                <Tab title="Profile">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">Profile Content</h3>
                        <p>This tab can be activated via the observable.</p>
                    </div>
                </Tab>
                <Tab title="Settings">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">Settings Content</h3>
                        <p>Settings tab content goes here.</p>
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}

// Styled Tabs Example
const StyledTabsExample = () => {
    return (
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Styled Tabs</h2>
            <Tabs cls="max-w-2xl mx-auto bg-white rounded-lg">
                <Tab cls="!bg-red-100 rounded-lg shadow-lg" title="Dashboard">
                    <div class="p-6">
                        <h3 class="text-2xl font-bold mb-4 text-gray-800">Dashboard</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-blue-100 p-4 rounded-lg">
                                <h4 class="font-semibold">Statistics</h4>
                                <p>View your analytics and metrics</p>
                            </div>
                            <div class="bg-green-100 p-4 rounded-lg">
                                <h4 class="font-semibold">Reports</h4>
                                <p>Generate detailed reports</p>
                            </div>
                            <div class="bg-purple-100 p-4 rounded-lg">
                                <h4 class="font-semibold">Notifications</h4>
                                <p>Check your alerts and messages</p>
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab cls="!bg-red-100 rounded-lg shadow-lg" title="Users">
                    <div class="p-6">
                        <h3 class="text-2xl font-bold mb-4 text-gray-800">User Management</h3>
                        <table class="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th class="py-2 px-4 border-b">Name</th>
                                    <th class="py-2 px-4 border-b">Email</th>
                                    <th class="py-2 px-4 border-b">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="py-2 px-4 border-b">John Doe</td>
                                    <td class="py-2 px-4 border-b">john@example.com</td>
                                    <td class="py-2 px-4 border-b">Admin</td>
                                </tr>
                                <tr>
                                    <td class="py-2 px-4 border-b">Jane Smith</td>
                                    <td class="py-2 px-4 border-b">jane@example.com</td>
                                    <td class="py-2 px-4 border-b">User</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Tab>
                <Tab cls="!bg-red-100 rounded-lg shadow-lg" title="Configuration">
                    <div class="p-6">
                        <h3 class="text-2xl font-bold mb-4 text-gray-800">System Configuration</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-700 mb-2">Site Name</label>
                                <input 
                                    type="text" 
                                    class="w-full p-2 border border-gray-300 rounded"
                                    value="My Website"
                                />
                            </div>
                            <div>
                                <label class="block text-gray-700 mb-2">Theme</label>
                                <select class="w-full p-2 border border-gray-300 rounded">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="notifications"
                                    class="mr-2"
                                />
                                <label for="notifications" class="text-gray-700">Enable Notifications</label>
                            </div>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    )
}

// Dynamic Tabs Example
const DynamicTabsExample = () => {
    const tabs = $([
        { id: 1, title: "Tab 1", content: "Content for the first tab" },
        { id: 2, title: "Tab 2", content: "Content for the second tab" }
    ])

    const addTab = () => {
        const newId = $$(tabs).length + 1
        tabs([...$$(tabs), { 
            id: newId, 
            title: `Tab ${newId}`, 
            content: `Content for tab ${newId}` 
        }])
    }

    const removeTab = (id: number) => {
        if ($$(tabs).length > 1) {
            tabs($$(tabs).filter(tab => tab.id !== id))
        }
    }

    return (
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Dynamic Tabs</h2>
            <div class="mb-4">
                <button 
                    class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                    onClick={addTab}
                >
                    Add Tab
                </button>
                <span>Number of tabs: {() => $$(tabs).length}</span>
            </div>
            <Tabs>
                {() => $$(tabs).map(tab => (
                    <Tab key={tab.id} title={tab.title}>
                        <div class="p-4 flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-semibold mb-2">{tab.title}</h3>
                                <p>{tab.content}</p>
                            </div>
                            <button 
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => removeTab(tab.id)}
                            >
                                Remove
                            </button>
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}

export {
    BasicTabsExample,
    ObservableTabsExample,
    StyledTabsExample,
    DynamicTabsExample,
}