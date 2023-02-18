import fs from 'fs'

export function generateID() {
    return Math.floor((1 + Math.random()) * 0x1000)
      .toString(16)
      .substring(0);
  }

export function generateWordList(){
  const LIST_LENGTH = 3;
  let rawData:String = fs.readFileSync("./words.txt", "utf8");
  let data:Array<String>
  /**
   * Check if current OS is windows or any other
   */
    if (process.platform == "win32") {
      data = rawData.split("\r\n");
    } else {
      data = rawData.split("\n");
    }
  /**
   * Grab three random words from data.
   */
  let list:Array<String> = [];
  for(var i = 0; i < LIST_LENGTH; i++){ 
    list.push(data[Math.floor(Math.random() * data.length)]);
  }

  return list;
}
