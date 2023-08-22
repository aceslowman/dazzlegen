let createParameterGroup = (legendText = "text") => {
    let groupElement = document.createElement("fieldset");
  
    groupElement.classList.add("levelParameter");
    let legend = document.createElement("legend");
    legend.innerText = legendText;
    groupElement.appendChild(legend);
  
    return groupElement;
  };
  
  let createParameterInput = (
    paramLegendText = "text",
    paramType = "number",
    idName = "id",
    paramDefaultValue = 0,
    eListener = () => {}
  ) => {
    let paramFieldset = document.createElement("fieldset");
  
    let paramLegend = document.createElement("legend");
    paramLegend.innerText = paramLegendText;
  
    let paramInput = document.createElement("input");
    paramInput.id = idName;
    paramInput.type = paramType;
    paramInput.value = paramDefaultValue;
    paramInput.step = 0.1;
  
    paramInput.addEventListener("input", eListener);
  
    paramFieldset.appendChild(paramLegend);
    paramFieldset.appendChild(paramInput);
  
    return paramFieldset;
  };
  
  export { createParameterGroup, createParameterInput };
  