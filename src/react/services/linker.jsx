export const getFromNode = async (resourceName, data) => {
  const result = await window.ipcRenderer.invoke(resourceName, data);
  return result;
};

export const getExchanges = async (data) => {
  const result = await window.ipcRenderer.invoke("getExchanges", data);
  return result;
};

export const sendMessageToNode = async (message) => {
  window.ipcRenderer.send("message", message);
};
