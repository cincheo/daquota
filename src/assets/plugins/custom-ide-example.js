
console.info("loading plugin example");

ide.componentTools = [
    {type: "HttpConnector", label: "Http Endpoint", category: "data-sources"},
    {type: "CookieConnector", label: "Cookie", category: "data-sources"},
    {type: "LocalStorageConnector", label: "Storage", category: "data-sources"},

    {type: "TextView", label: "Text/HTML", category: "basic-components"},
    {type: "ImageView", label: "Image", category: "basic-components"},
    {type: "IconView", label: "Icon", category: "basic-components"},
    {type: "TableView", label: "Table", category: "basic-components"},


    {type: "CheckboxView", label: "Checkbox", category: "input-components"},
    {type: "SelectView", label: "Select", category: "input-components"},
    {type: "InputView", label: "Input", category: "input-components"},
    {type: "TextareaView", label: "Textarea", category: "input-components"},
    {type: "ButtonView", label: "Button", category: "input-components"},
    {type: "ImageView", label: "Image", category: "input-components"},
    {type: "IconView", label: "Icon", category: "input-components"},
    {type: "DatepickerView", label: "Date picker", category: "input-components"},
    {type: "TimepickerView", label: "Time picker", category: "input-components"},

    {type: "ContainerView", label: "Container", category: "layout"},
    {type: "SplitView", label: "Split", category: "layout"},
    {type: "CardView", label: "Card", category: "layout"},
    {type: "TabsView", label: "Tabs", category: "layout"},

];
