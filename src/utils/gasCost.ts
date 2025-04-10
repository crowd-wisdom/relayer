import { ethers} from "ethers";

export async function getGasCost(provider: ethers.Provider) {
    try {
      const feeData = await provider.getFeeData();
 
      // Para redes legacy (sin EIP-1559), solo estará disponible gasPrice
      if (feeData.gasPrice) {
        return feeData.gasPrice
      }
  
      // Para redes con EIP-1559, estarán disponibles maxFeePerGas y maxPriorityFeePerGas
      if (feeData.maxFeePerGas) {
        return feeData.maxFeePerGas
      }
  
      if (feeData.maxPriorityFeePerGas) {
        return feeData.maxPriorityFeePerGas
      }
  
  
    } catch (error) {
      console.error('Error al obtener la información de las tarifas de gas:', error);
      return null;
    }
  }