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

let createAdjustableNumberInput = (ele, cb, min, max, isInt = false) => {
  ele.addEventListener("change", (e) => cb(Number(e.target.value)));

  ele.addEventListener("mousedown", (e) => {
    // reject clicks near arrows on the right hand side
    let inputBounds = ele.getBoundingClientRect();
    if ((e.clientX - inputBounds.x) / inputBounds.width > 0.5) return;
    document.body.style.cursor = "ns-resize";

    let starting_position = { x: Number(e.clientX), y: Number(e.clientY) };
    let starting_value = Number(ele.value);

    let handleMouseMove = (e) => {
      e.preventDefault();
      let current_position = { x: Number(e.clientX), y: Number(e.clientY) };

      /* TODO make this a constant value based on step */
      if (current_position.x - starting_position.x < 50) {
        ele.value =
          starting_value +
          Number((starting_position.y - current_position.y) * 0.05);
      } else {
        ele.value =
          starting_value + (starting_position.y - current_position.y) * 0.1;
      }

      if (ele.step) ele.value = Number(ele.value).toFixed();

      if (min !== undefined && ele.value < min) {
        ele.value = min;
      }

      if (isInt) {
        ele.value = Math.floor(ele.value);
      }

      cb(Number(ele.value));
    };

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", handleMouseMove);
    });
  });
};

export {
  createParameterGroup,
  createParameterInput,
  createAdjustableNumberInput,
};
