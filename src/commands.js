class CommandManager {

    undoStack = [];
    redoStack = [];
    disableHistory = true;

    beginGroup() {
        if (this.disableHistory) {
            return;
        }
        this.add(new CommandGroup());
    }

    endGroup() {
        if (this.lastCommand()?.isLocked === false) {
            this.lastCommand().isLocked = true;
        }
    }

    lastCommand() {
        return this.undoStack[this.undoStack.length - 1];
    }

    add(command) {
        if (this.disableHistory) {
            return;
        }
        this.redoStack = [];
        if (this.undoStack.length > 0 && this.lastCommand().canMerge(command)) {
            this.lastCommand().merge(command);
        } else {
            this.undoStack.push(command);
        }
    }

    execute(command) {
        this.add(command);
        return command.execute();
    }

    undo() {
        if (this.disableHistory) {
            return;
        }
        this.disableHistory = true;
        try {
            ide.selectComponent(undefined);
            ide.hideOverlays();
            console.info('command manager', 'undo start');
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
        } finally {
            this.disableHistory = false;
            console.info('command manager', 'undo stop');
        }
    }

    canUndo() {
        return !this.disableHistory && this.undoStack.length > 0;
    }

    canRedo() {
        return !this.disableHistory && this.redoStack.length > 0;
    }

    redo() {
        if (this.disableHistory) {
            return;
        }
        this.disableHistory = true;
        try {
            ide.selectComponent(undefined);
            ide.hideOverlays();
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
        } finally {
            this.disableHistory = false;
        }
    }
}

class Command {
    type;

    constructor() {
        this.type = this.constructor.name;
    }

    canMerge(command) {
        return false;
    }

    merge(command) {
        throw new Error('cannot merge command');
    }

    execute() {
        throw new Error('unimplemented');
    }

    undo() {
        throw new Error('unimplemented');
    }
}

class SetProperty extends Command {
    cid;
    prop;
    oldValue;
    newValue;

    constructor(cid, prop, oldValue, newValue) {
        super();
        this.cid = cid;
        this.prop = prop;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    canMerge(command) {
        return command.type == this.type && command.cid == this.cid && command.prop == this.prop;
    }

    merge(command) {
        this.newValue = command.newValue;
    }

    execute() {
        const model = components.getComponentModel(this.cid);
        if (model) {
            $set(model, this.prop, this.newValue);
        }
    }

    undo() {
        const model = components.getComponentModel(this.cid);
        if (model) {
            $set(model, this.prop, this.oldValue);
        }
    }
}

class CommandGroup extends Command {
    commands = [];
    isLocked = false;

    lock() {
        this.isLocked = true;
    }

    canMerge(command) {
        return !this.isLocked;
    }

    merge(command) {
        this.commands.push(command);
    }

    execute() {
        this.commands.forEach(command => command.execute());
    }

    undo() {
        this.commands.forEach(command => command.undo());
    }

}


class SetStyleUrl extends Command {
    styleUrl;
    darkMode;

    initialStyleUrl;
    initialDarkMode;

    constructor(styleUrl, darkMode) {
        super();
        this.styleUrl = styleUrl;
        this.darkMode = darkMode;
    }

    execute() {
        this.initialStyleUrl = applicationModel.bootstrapStylesheetUrl;
        this.initialDarkMode = applicationModel.darkMode;
        ide.setStyleUrl(this.styleUrl, this.darkMode);
    }

    undo() {
        ide.setStyleUrl(this.initialStyleUrl, this.initialDarkMode)
    }
}


class CreateComponent extends Command {
    componentType;
    cid;
    initialAutoIncrementId;

    constructor(componentType) {
        super();
        this.componentType = componentType;
        //this.viewModel = JSON.parse(JSON.stringify(viewModel));
    }

    execute() {
        const viewModel = components.createComponentModel(this.componentType);
        this.initialAutoIncrementId = applicationModel.autoIncrementIds[this.componentType];
        components.registerComponentModel(viewModel, this.cid);
        this.cid = viewModel.cid;
        return viewModel;
    }

    undo() {
        applicationModel.autoIncrementIds[this.componentType] = this.initialAutoIncrementId;
        components.unregisterComponentModel(this.cid);
    }
}

class SetChild extends Command {
    location;
    childCid;
    oldChildCid;

    constructor(location, childCid) {
        super();
        this.location = JSON.parse(JSON.stringify(location));
        this.childCid = childCid;
    }

    execute() {
        this.oldChildCid = components.getReplacedComponentIdAtLocation(location);
        components.setChild(this.location, components.getComponentModel(this.childCid));
        ide.selectComponent(this.childCid);
    }

    undo() {
        if (this.oldChildCid) {
            components.setChild(this.location, components.getComponentModel(this.oldChildCid));
            ide.selectComponent(this.oldChildCid);
        } else {
            components.unsetChild(this.location);
            ide.selectComponent(undefined);
            ide.hideOverlays();
        }
    }
}

class MoveComponent extends Command {
    toLocation;
    cid;

    fromLocation;
    finalToLocation;
    oldChildCidAtToLocation;

    constructor(cid, toLocation) {
        super();
        this.cid = cid;
        this.toLocation = JSON.parse(JSON.stringify(toLocation));
    }

    execute() {
        const parentCid = components.findParent(this.cid);
        if (parentCid) {
            this.fromLocation = components.getKeyAndIndexInParent(components.getComponentModel(parentCid), this.cid);
            if (this.fromLocation) {
                components.unsetChild(this.fromLocation);
                console.info('move from', this.fromLocation);
                this.finalToLocation = {
                    cid: this.toLocation.cid,
                    key: this.toLocation.key,
                    index: this.toLocation.index
                };
                if (this.fromLocation.cid === this.finalToLocation.cid &&
                    this.fromLocation.key === this.finalToLocation.key &&
                    this.finalToLocation.index !== undefined && this.finalToLocation.index > this.fromLocation.index
                ) {
                    this.finalToLocation.index--;
                }
                this.oldChildCidAtToLocation = components.getReplacedComponentIdAtLocation(this.finalToLocation);
                components.setChild(this.finalToLocation, components.getComponentModel(this.cid));
                ide.selectComponent(this.cid);
            }
        }
    }

    undo() {
        if (this.fromLocation) {
            if (this.oldChildCidAtToLocation) {
                components.setChild(this.finalToLocation, components.getComponentModel(this.oldChildCidAtToLocation));
            } else {
                components.unsetChild(this.finalToLocation);
            }
            components.setChild(this.fromLocation, components.getComponentModel(this.cid));
            ide.selectComponent(this.cid);
        }
    }
}

class DetachComponent extends Command {
    cid;
    parentCid;
    keyAndIndex;

    constructor(cid) {
        super();
        this.cid = cid;
    }

    execute() {
        if (!this.cid) {
            throw new Error("undefined cid");
        }
        const parentComponentModel = components.getComponentModel(components.findParent(this.cid));
        this.parentCid = parentComponentModel.cid;
        this.keyAndIndex = components.getKeyAndIndexInParent(parentComponentModel, this.cid);
        if (this.keyAndIndex.index > -1) {
            // array case
            parentComponentModel[this.keyAndIndex.key].splice(this.keyAndIndex.index, 1);
        } else {
            parentComponentModel[this.keyAndIndex.key] = undefined;
        }
        components.cleanParentId(this.cid);
        ide.selectComponent(undefined);
        ide.hideOverlays();
        $tools.toast(
            $c('navbar'),
            'Component trashed',
            'Successfully moved component to the trash.',
            'success'
        );

    }

    undo() {
        components.setChild({
            cid: this.parentCid,
            key: this.keyAndIndex.key,
            index: this.keyAndIndex.index
        }, components.getComponentModel(this.cid))
    }
}

class BuildCollectionEditor extends Command {
    modelParser;
    modelClass;
    key;
    split;
    collectionContainerType;
    createInstance;
    updateInstance;
    deleteInstance;
    useClassNameInButtons;
    dataSource;

    initialAutoIncrementIds;
    cid;

    constructor(
        modelParser,
        modelClass,
        key,
        split,
        collectionContainerType,
        createInstance,
        updateInstance,
        deleteInstance,
        useClassNameInButtons,
        dataSource
    ) {
        super();
        this.modelParser = modelParser;
        this.modelClass = modelClass;
        this.key = key;
        this.split = split;
        this.collectionContainerType = collectionContainerType;
        this.createInstance = createInstance;
        this.updateInstance = updateInstance;
        this.deleteInstance = deleteInstance;
        this.useClassNameInButtons = useClassNameInButtons;
        this.dataSource = dataSource;
    }

    execute() {
        this.initialAutoIncrementIds = JSON.parse(JSON.stringify(applicationModel.autoIncrementIds));
        const container = components.buildCollectionEditor(
            this.modelParser,
            this.modelClass,
            this.key,
            this.split,
            this.collectionContainerType,
            this.createInstance,
            this.updateInstance,
            this.deleteInstance,
            this.useClassNameInButtons,
            this.dataSource
        );

        components.registerComponentModel(container);
        this.cid = container.cid;

        // this.oldChildCid = components.getReplacedComponentIdAtLocation(ide.getTargetLocation());
        // components.setChild(ide.getTargetLocation(), container);
        // ide.selectComponent(container.cid);
        //
        // if (this.dataModel) {
        //     $c('navbar').$nextTick(() => {
        //         $c(container.cid).setData(this.dataModel);
        //     });
        // }
        //
        // this.cid = viewModel.cid;
        return container;
    }

    undo() {
        for (const [type, id] of Object.entries(applicationModel.autoIncrementIds)) {
            console.info('checking', type, id, this.initialAutoIncrementIds[type]);
            for (let i = this.initialAutoIncrementIds[type] === undefined ? 0 : this.initialAutoIncrementIds[type]; i < id; i++) {
                const cid = components.baseId(type) + '-' + i;
                console.info('unregister', cid);
                components.unregisterComponentModel(cid);
            }
        }
        applicationModel.autoIncrementIds = this.initialAutoIncrementIds;

    }
}

class BuildInstanceForm extends Command {
    modelParser;
    modelClass;
    inline;
    disabled;
    dataSource;

    initialAutoIncrementIds;
    cid;

    constructor(
        modelParser,
        modelClass,
        inline,
        disabled,
        dataSource
    ) {
        super();
        this.modelParser = modelParser;
        this.modelClass = modelClass;
        this.inline = inline;
        this.disabled = disabled;
        this.dataSource = dataSource;
    }

    execute() {
        this.initialAutoIncrementIds = JSON.parse(JSON.stringify(applicationModel.autoIncrementIds));
        const container = components.buildInstanceForm(
            this.modelParser,
            this.modelClass,
            this.inline,
            this.disabled,
            this.dataSource
        );

        components.registerComponentModel(container);
        this.cid = container.cid;

        return container;
    }

    undo() {
        for (const [type, id] of Object.entries(applicationModel.autoIncrementIds)) {
            console.info('checking', type, id, this.initialAutoIncrementIds[type]);
            for (let i = this.initialAutoIncrementIds[type] === undefined ? 0 : this.initialAutoIncrementIds[type]; i < id; i++) {
                const cid = components.baseId(type) + '-' + i;
                console.info('unregister', cid);
                components.unregisterComponentModel(cid);
            }
        }
        applicationModel.autoIncrementIds = this.initialAutoIncrementIds;

    }
}

