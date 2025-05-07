const specificationFields = {
    pc: [
        { name: 'processor', label: 'Processor', type: 'text' },
        { name: 'ram', label: 'RAM', type: 'text' },
        { name: 'storage', label: 'Storage', type: 'text' },
        { name: 'graphicsCard', label: 'Graphics Card', type: 'text' },
        { name: 'motherboard', label: 'Motherboard', type: 'text' },
        { name: 'powerSupply', label: 'Power Supply', type: 'text' },
        { name: 'case', label: 'Case', type: 'text' },
        { name: 'operatingSystem', label: 'Operating System', type: 'text', required: false }
    ],
    laptop: [
        { name: 'processor', label: 'Processor', type: 'text' },
        { name: 'ram', label: 'RAM', type: 'text' },
        { name: 'storage', label: 'Storage', type: 'text' },
        { name: 'displaySize', label: 'Display Size', type: 'text' },
        { name: 'graphicsCard', label: 'Graphics Card', type: 'text' },
        { name: 'batteryLife', label: 'Battery Life', type: 'text' },
        { name: 'weight', label: 'Weight', type: 'text' },
        { name: 'operatingSystem', label: 'Operating System', type: 'text', required: false }
    ],
    cpu: [
        { name: 'socket', label: 'Socket', type: 'text' },
        { name: 'cores', label: 'Cores', type: 'number' },
        { name: 'threads', label: 'Threads', type: 'number' },
        { name: 'baseSpeed', label: 'Base Speed', type: 'text' },
        { name: 'boostSpeed', label: 'Boost Speed', type: 'text' },
        { name: 'cache', label: 'Cache', type: 'text' },
        { name: 'tdp', label: 'TDP', type: 'text' }
    ],
    graphicsCard: [
        { name: 'chipset', label: 'Chipset', type: 'text' },
        { name: 'memory', label: 'Memory', type: 'text' },
        { name: 'memoryType', label: 'Memory Type', type: 'text' },
        { name: 'coreClock', label: 'Core Clock', type: 'text' },
        { name: 'boostClock', label: 'Boost Clock', type: 'text' },
        { name: 'powerConsumption', label: 'Power Consumption', type: 'text' },
        { name: 'ports', label: 'Ports', type: 'text' }
    ],
    motherboard: [
        { name: 'socket', label: 'Socket', type: 'text' },
        { name: 'chipset', label: 'Chipset', type: 'text' },
        { name: 'formFactor', label: 'Form Factor', type: 'text' },
        { name: 'memorySlots', label: 'Memory Slots', type: 'number' },
        { name: 'maxMemory', label: 'Maximum Memory', type: 'text' },
        { name: 'supportedMemoryType', label: 'Supported Memory Type', type: 'text' },
        { name: 'pcieSlots', label: 'PCIe Slots', type: 'text' },
        { name: 'sataConnectors', label: 'SATA Connectors', type: 'number' }
    ],
    memory: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'capacity', label: 'Capacity', type: 'text' },
        { name: 'speed', label: 'Speed', type: 'text' },
        { name: 'latency', label: 'Latency', type: 'text' },
        { name: 'voltage', label: 'Voltage', type: 'text' }
    ],
    storage: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'capacity', label: 'Capacity', type: 'text' },
        { name: 'formFactor', label: 'Form Factor', type: 'text' },
        { name: 'interface', label: 'Interface', type: 'text' },
        { name: 'readSpeed', label: 'Read Speed', type: 'text' },
        { name: 'writeSpeed', label: 'Write Speed', type: 'text' }
    ],
    monitor: [
        { name: 'displaySize', label: 'Display Size', type: 'text' },
        { name: 'resolution', label: 'Resolution', type: 'text' },
        { name: 'panelType', label: 'Panel Type', type: 'text' },
        { name: 'refreshRate', label: 'Refresh Rate', type: 'text' },
        { name: 'responseTime', label: 'Response Time', type: 'text' },
        { name: 'ports', label: 'Ports', type: 'text' },
        { name: 'hdrSupport', label: 'HDR Support', type: 'checkbox' }
    ],
    gears: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'connectivity', label: 'Connectivity', type: 'text' },
        { name: 'features', label: 'Features', type: 'text' }
    ]
};

export default specificationFields; 