export const getFromNode = async (data) => {
  const result = await window.ipcRenderer.invoke("ipc-data", data);
  console.log(result);
};

export const sendMessageToNode = async (message) => {
  window.ipcRenderer.send("message", message);
};
