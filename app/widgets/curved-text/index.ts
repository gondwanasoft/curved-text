const construct = el => {
  const textEl = el.getElementById('text')
  const positionEl = el.getElementById('position')
  const orientationEl = el.getElementById('orientation')
  const containerEl = el.getElementById('container')

  //CIRCLE ATTRIBUTES
  //containerEl.groupTransform.translate.x = centerX ;
  //containerEl.groupTransform.translate.y = centerY ;
  containerEl.x = positionEl.cx;
  containerEl.y = positionEl.cy;
  //alignRotate.groupTransform.translate.x =  0;
  //alignRotate.groupTransform.translate.y =  0 ;
  let radius = positionEl.r   //if negative, text is bottom curve
  let textAnchor: string = textEl.textAnchor; //0: middle, 1: start,  2: end at 0°
  console.log(`sweepAngle=${orientationEl.sweepAngle}`)
  let letterSpacing: number = textEl.letterSpacing!==undefined? textEl.letterSpacing : 0;
  let charAngle: number = orientationEl.sweepAngle? orientationEl.sweepAngle : 0; //angle each char, chars are stacked at 0° if no setting. If undefined, "auto" mode.
  if (radius < 0) charAngle = -charAngle;   //PREVENT MIRRORING

  el.redraw = () => {   // TODO G 4 does redraw() need to be public?
    let alignRotate = el.getElementById("alignRotate") as GroupElement;

    /*YOUR SETTINGS---------------------------------------------------------------------------------------------------------------*/
    //textEl.text = "widget"// enter text ar data here MiW!MiW!MiW!M
    // centerX is now taken from positionEl.cx
    // centerY is now taken from positionEl.cy

    let mode: number = 1; // 0: automatic, 1: rotate fix angle each
    console.log("mode: "+ (mode == 0 ? "auto" : "fix"));
    //CIRCLE
    //let radius: number = 50;//if negative, text is bottom curve
    //let centerX: number = 250;
    //console.log("center: x "+centerX);
    //let centerY: number = 250; // center of the circle
    //console.log("center: y " + centerY)

    //TEXT
    let rotateText: number = 0;//angle to rotate whole text from it´s beginning
    console.log("rotate text: "+ rotateText + "°");
    console.log("textAnchor: "+ textAnchor);
    //ANGLE FOR FIX ROTATION
    //let charAngle: number = 25;//angle each char, chars are stacked at 0° if no setting
    //-----------------------------------------------------------------------------------------------------------------------------

    //VARIABLES
    //ASSIGN CHARS
    let chars = (textEl.text.split("")); // array of char set of text to curve
    let char  = el.getElementsByClassName("char") as TextElement[];// single char textElements
    const numChars = chars.length

    //APPLY FONT FAMILY AND SIZE
    // TODO G 3 does this need to be in redraw()?
    const fontSize = textEl.style.fontSize
    if (fontSize > 0)
      for (let i = 0; i < numChars; i++) char[i].style.fontSize = fontSize
    const fontFamily = textEl.style.fontFamily
      for (let i = 0; i < numChars; i++) char[i].style.fontFamily = fontFamily

    //CIRCUMFERENCE FOR AUTO
    const circ = 2 * radius * Math.PI;
    const degreePx = 360 / circ;

    //PREVENT MIRRORING
    //charAngle = charAngle * (radius < 0 ? -1 : 1);  // moved out of redraw() so charAngle doesn't get negated repeatedly

    char[0].text = chars[0];
    let y = radius < 0 ? -radius : -radius + char[0].getBBox().height / 2;  //define y of text, based on radius
    let stringAngle = rotateText;

    //AUTO MODE
    if (mode === 0) {
      let cumWidth: number = 0;
      for (let i: number = 0; i < numChars ; i++) {
        //apply text and y
        char[i].text = chars[i];// assign chars to the single textElements
        char[i].y = y

        //Variables for positioning chars
        let charWidth = char[i].getBBox().width;
        cumWidth += charWidth;  //  (thank you, Peter for this neat example of simplifying and efficiency!)


        //ROTATION PER CHAR
        (char[i].parent as GroupElement).groupTransform.rotate.angle =
        (cumWidth  - charWidth / 2 +  (i) * letterSpacing )  * degreePx;


      } // end of char loop

      //TEXT-ANCHOR MODE AUTO
      switch(textAnchor) {
        case 'middle':
          stringAngle -= (cumWidth + ((numChars -1) * letterSpacing)) * degreePx / 2;//ok
          break;
        case 'end':
          //stringAngle = -(stringAngle -= (cumWidth + (numChars - 1 ) * letterSpacing  ) * degreePx);// NOT ok
          stringAngle -= (cumWidth + (numChars - 1 ) * letterSpacing  ) * degreePx
          break;
      }
    } else if (mode === 1) {

      for (let i: number = 0; i < numChars ; i++) {
        //apply text and y
        char[i].text = chars[i];  // assign chars to the single textElements
        char[i].y = y;  //define y of text, based on radius

        //ROTATION PER CHAR
        (char[i].parent as GroupElement).groupTransform.rotate.angle = i * charAngle  ;



      } // end of char loop

        //TEXT-ANCHOR MODE FIX
      switch(textAnchor) {
        case 'middle':
          const firstChar = char[0].getBBox().width;
          stringAngle -= ((numChars -1)  * ((charAngle / 2) ?? 0 )) + firstChar / 2 * degreePx;//ok
        case 'start':
          //const firstChar = char[0].getBBox().width;
          stringAngle += firstChar / 2 * degreePx ;//ok
          break;
        case 'end':
          const lastChar = char[numChars-1].getBBox().width;
          stringAngle += (numChars - 1 ) * - charAngle - lastChar / 2 * degreePx;
          break;
      }
    };
    alignRotate.groupTransform.rotate.angle = stringAngle;
}

  el.redraw()   // TODO G 2 may not be nec

  return el
}

export default () => {
  return {
    name: 'curvedText',
    construct: construct
  }
}