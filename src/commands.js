class CommandManager {
    undoStack = [];
    redoStack = [];
    disableHistory = false;
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

class CreateComponent extends Command {
    componentType;
    cid;
    constructor(componentType) {
        super();
        this.componentType = componentType;
        //this.viewModel = JSON.parse(JSON.stringify(viewModel));
    }
    execute() {
        this.viewModel = components.createComponentModel(this.componentType);
        components.registerComponentModel(this.viewModel, this.cid);
        console.info('created component', this.viewModel);
        return this.viewModel;
    }
    undo() {
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
        this.oldChildCid = components.getReplacedComponentIdAtLocation(location);
    }
    execute() {
        components.setChild(this.location, components.getComponentModel(this.childCid));
    }
    undo() {
        console.info('UNDO YY', this.location);
        if (this.oldChildCid) {
            components.setChild(this.location, components.getComponentModel(this.oldChildCid));
        } else {
            components.unsetChild(this.location);
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
        components.setChild({cid: this.parentCid, key: this.keyAndIndex.key, index: this.keyAndIndex.index}, components.getComponentModel(this.cid))
    }
}


