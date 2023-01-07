const { initApyhub, charts } =require("apyhub");
require("dotenv").config();
initApyhub(process.env.APYTOKEN);


// const { charts } = require("apyhub");

  const data = [
    { value: 10, label: "A" },
    { value: 20, label: "B" },
    { value: 30, label: "C" },
    { value: 40, label: "D" },
  ];

  charts({
    responseFormat: "file",
    chartType: "bar",
    output: "chart.png",
    title: "My Chart",
    theme: "light",
    data,
  }).then((res) => {
    console.log(res);
  });