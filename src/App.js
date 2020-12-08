import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super (props);
   
      //default value for board size is 5x5, small, graphics: dice, difficulty: easy.
      var sizex = 5;
      var sizey = 5;

      //version is board size
      var version = localStorage.getItem('version');

      //dice is whether graphics is number or dice
      var dice = localStorage.getItem('dice');

      var diceClass = "dice5";
    
      if (dice == "number") {
          diceClass = "number5";
          dice = "number";
     
      }
      else {
        diceClass = "dice5";
        dice = "dice";
      
      }

    var c = Array(sizey).fill().map(_ =>
      Array(sizex).fill().map(_ => ""));
    c[1][1] = "limegreen";
    c[0][1] = "limegreen";
    c[1][0] = "limegreen";
    c[0][0] = "limegreen";

    c[3][3] = "yellow";
    c[3][4] = "yellow";
    c[4][3] = "yellow";
    c[4][4] = "red";

    console.log(c)

    this.state = {
      turn: true,
      bigturn: false,
      green:0,
      royalblue:0,
      violet:0,
      p : Array(sizey).fill().map(_ => 
        Array(sizex).fill().map(_ => 0) ),  
        c,
        buttonGrid : Array(15).fill().map(_ => 
          Array(15).fill().map(_ => 35) ),  
          diceGrid : Array(15).fill().map(_ => 
            Array(15).fill().map(_ => 55) ),  
          d: Array(sizey).fill().map(_ => 
            Array(sizex).fill().map(_ => "white" ) ), 
      easy : "yellow",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      info : 2,
      sizex,
      dont: "number",
      sizey,
      render : 120,
      version,
      counting: 1,
      autoplay: false,
      speed: 200,
      black: 0,
      orchid: 0,
      silver: 0,
      queue: [],
      allowOpponentMove: false,
      diceClass,
      dice,
      randomNumber: 5,
      visible: ["visible", "visible", "hidden", "hidden", "hidden"]
      
    }

    this.boxClicked = this.boxClicked.bind(this)
    this.easy = this.easy.bind(this)
    this.medium = this.medium.bind(this)
    this.hard = this.hard.bind(this)
    this.imba = this.imba.bind(this)
    this.versionChange = this.versionChange.bind(this)
    this.handleAutoplay = this.handleAutoplay.bind(this)
    this.setSpeed = this.setSpeed.bind(this)
    this.changeDice = this.changeDice.bind(this)
    this.reset = this.reset.bind(this)
    
    
  }
 
  handleAutoplay (){

    //turns autoplay on or off
    this.setState({
      autoplay: !this.state.autoplay
    })

    //when autoplay is stopped, set number to 5, to look nice
    setTimeout (() => { if (this.state.autoplay == false) {
      this.setState({
        randomNumber: 5
      })
    }}, 500)
   

  }

  colorBlink (a,b, color="white") {
    var dd = this.state.d;
    dd[a][b] = color;
    this.setState({
      d: dd
    })

    var gg = this.state.buttonGrid
    gg[a][b] = 56
    this.setState({
      buttonGrid: gg
    })

    setTimeout(() => {
      var gg = this.state.buttonGrid
    gg[a][b] = 35
    this.setState({buttonGrid:gg})

    },50)

    setTimeout(() => {
      var dd = this.state.d;
      dd[a][b] = "black";
      this.setState({
        d: dd
      })
    }, 100)
    this.updateGraph()
  }

  updateGraph () {
    var black = 0;
    var green = 0;
    var red=0;
    var silver=0;
    var royalblue=0;
    var violet=0;
    var orchid=0;
    for (var r=0; r<this.state.sizey; r++){
      for (var s=0; s<this.state.sizex; s++)
        {
          if (this.state.c[r][s] == "#111") {black += 1}
          else if (this.state.c[r][s] == "limegreen") {green += 1}
          else if (this.state.c[r][s] == "red") {red += 1}
          else if (this.state.c[r][s] == "royalblue") {royalblue += 1}
          else if (this.state.c[r][s] == "black") {black += 1}
          else if (this.state.c[r][s] == "violet") {violet += 1}
          else if (this.state.c[r][s] == "#eee") {silver += 1}
          else if (this.state.c[r][s] == "orchid") {orchid += 1}
        }
      }
    
    this.setState({
      green,
      royalblue,
      violet,
      red,
      black,
      silver,
      orchid,
    })

      //finally, I need to store whether given player is still in game or not, to display his color on graph, or hide his element completely. this is caused becuase setting width to 0 is not enough.
      var visible_temp = this.state.visible;
      if (green == 0) {
        visible_temp[0] = "hidden"
      }
      else {
        visible_temp[0] = "visible"
      }

      if (red == 0) {
        visible_temp[1] = "hidden"
      }
      else {
        visible_temp[1] = "visible"
      }

      if (royalblue == 0) {
        visible_temp[2] = "hidden"
      }
      else {
        visible_temp[2] = "visible"
      }

      if (violet == 0) {
        visible_temp[3] = "hidden"
      }
      else {
        visible_temp[3] = "visible"
      }

      if (orchid == 0) {
        visible_temp[4] = "hidden"
      }
      else {
        visible_temp[4] = "visible"
      }

      this.setState({
        visible: visible_temp,
      })
  }



 ////////////////// Following scripts handle functioning of AI - computer opponents.. Opponents strength is: red < blue < pink
 aiRed() {
  //AI red

  for (let i = 1; i <= this.state.info; i++) {
    setTimeout(() => {
      for (var y = 0; y < this.state.sizey; y++) {
        for (var yy = 0; yy < this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6) {
            this.changeActiveMedia(y, yy, "yes");
            i -= 1;
            continue;
          }
        }
      }

      var om = 99;

      while (om > 0) {
        var a2 = Math.floor(this.state.sizey * Math.random())
        var b2 = Math.floor(this.state.sizex * Math.random())
        if (this.state.c[a2][b2] == "red") {
          var qq = this.state.queue;
          qq.push([a2, b2, this.state.c[a2][b2], "red"])
          this.setState({
            queue: qq
          })
          if (this.state.info == 1.5) {
            om -= 50;
          }
          else {
            om = 0;
          }
        }
        om -= 1;
      }
    }, 11 * i)
  }
  //AI red
}

aiBlue() {
  //AI blue

  for (let ib = 1; ib <= this.state.info; ib++) {

    setTimeout(() => {

      for (var y = 0; y < this.state.sizey; y++) {
        for (var yy = 0; yy < this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6) {
            this.changeActiveMedia(y, yy, "yes");
            ib -= 1;
            continue;
          }
        }
      }

      var omb = 9999;

      for (let y9 = 0; y9 < this.state.sizey; y9++) {

        for (let yy9 = 0; yy9 < this.state.sizex; yy9++) {
          if (this.state.p[y9][yy9] === 6 && this.state.c[y9][yy9] ===
            "royalblue") {

            var qq = this.state.queue;

            qq.push([y9, yy9, this.state.c[y9][yy9], "royalblue"])

            this.setState({
              queue: qq
            })

            if (omb > 100 && this.state.info == 1.5) {
              omb = 100;
            }
            else {
              omb = 0;
              break;
            }
          }
        }
      }

      while (omb > 0) {
        var a2 = Math.floor(this.state.sizey * Math.random())
        var b2 = Math.floor(this.state.sizex * Math.random())
        if (this.state.c[a2][b2] == "royalblue") {

          var qq = this.state.queue;
          qq.push([a2, b2, this.state.c[a2][b2], "royalblue"])
          this.setState({
            queue: qq
          })

          omb = 0;
        }
        omb -= 1;
      }
    }, 22 * ib)
  }
  //AI blue
}

aiViolet() {

  //AI violet

  for (let ic = 1; ic <= this.state.info; ic++) {
    setTimeout(() => {

      for (var y = 0; y < this.state.sizey; y++) {
        for (var yy = 0; yy < this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6) {
            this.changeActiveMedia(y, yy, "yes");
            ic -= 1;
            continue;
          }
        }
      }

      var omc = 9999;

      for (let y9 = 0; y9 < this.state.sizey; y9++) {

        for (let yy9 = 0; yy9 < this.state.sizex; yy9++) {
          if (this.state.p[y9][yy9] === 6 && (this.state.c[y9][yy9] ===
              "orchid" || this.state.c[y9][yy9] === "violet")) {

            var qq = this.state.queue;
            qq.push([y9, yy9, this.state.c[y9][yy9], "violet"])
            this.setState({
              queue: qq
            })

            if (omc > 100 && this.state.info == 1.5) {
              omc = 100;
            }
            else {
              omc = 0;
              break;
            }
          }
        }
      }

      while (omc > 0) {
        var a2 = Math.floor(this.state.sizey * Math.pow(Math.random(),
          2))
        var b2 = Math.floor(this.state.sizex * Math.pow(Math.random(),
          2))
        if ((Math.random() > 0.8 || this.state.p[a2][b2] > 4) && (this.state
            .c[a2][b2] == "orchid" && ((a2 + 1 < this.state.sizey &&
                this.state.c[a2 + 1][b2] != "orchid") || (b2 + 1 < this
                .state.sizex && this.state.c[a2][b2 + 1] != "orchid") ||
              (a2 > 0 && this.state.c[a2 - 1][b2] != "orchid") || (b2 >
                0 && this.state.c[a2][b2 - 1] != "orchid")) || this.state
            .c[a2][b2] == "violet" && ((a2 + 1 < this.state.sizey &&
                this.state.c[a2 + 1][b2] != "violet") || (b2 + 1 < this
                .state.sizex && this.state.c[a2][b2 + 1] != "violet") ||
              (a2 > 0 && this.state.c[a2 - 1][b2] != "violet") || (b2 >
                0 && this.state.c[a2][b2 - 1] != "violet")))) {

          var qq = this.state.queue;
          qq.push([a2, b2, this.state.c[a2][b2], "violet"])
          this.setState({
            queue: qq
          })

          omc = 0;
        }
        omc -= 1;
      }
    }, 33 * ic)
  }
  //AI violet

}

aiGreen() {

  //AI green

  for (let ig = 1; ig <= this.state.info; ig++) {
    setTimeout(() => {

      for (var y = 0; y < this.state.sizey; y++) {
        for (var yy = 0; yy < this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6) {
            this.changeActiveMedia(y, yy, "yes");
            ig -= 1;
            continue;
          }
        }
      }

      var omg = 9999;

      while (omg > 0) {
        var a2 = Math.floor(this.state.sizey * Math.random())
        var b2 = Math.floor(this.state.sizex * Math.random())
        if (this.state.c[a2][b2] == "limegreen") {
          var qq = this.state.queue;

          qq.push([a2, b2, this.state.c[a2][b2], "red"])

          this.setState({
            queue: qq
          })
          omg = 0;
        }
        omg -= 1;
      }
    }, 6 * ig)

    //AI green
  }

}

      //I clicked on the box (dice) only if autoplay is off and only if I clicked on my color and only if it is my turn
  boxClicked(event, a, b) {

    if (!this.state.autoplay)
    {

          console.log("click - freeze: ", this.freeze)
            if (this.state.c[a][b] != "limegreen") {return}

            //freeze prevents doublicking and increasing number by 2 in short time
            if (this.freeze == 1) {
                this.freeze = 0;
                setTimeout(() => {
                  this.freeze = 1;
                }, 150);
                if (this.state.turn) {
                          
                    this.setState({
                      turn : false,
                      bigturn: false,
                    });

                    this.moveDice (a,b,this.state.c[a][b]);
                    }

                    //bigturn is used to allow user click even before computer moves are finished. his move is recorded to queue and used at the end, but only once. bigturn prevents using more times.
                else if (this.state.bigturn == true && this.state.queue.length < 40) {
                  var qq = this.state.queue;
                    
                      //  I need to verify if some other move isn't already changing my color
                      qq.push([a,b,this.state.c[a][b],"limegreen"]) 
                
                      this.setState ({    
                        queue : qq,
                        turn : false,
                        bigturn: false,
                      })

                }
            }

      } 
    
        this.setState({allowOpponentMove : true})

  }

  componentDidMount() {
    this.freeze = 1;
    this.interval = setInterval(this.gameCycle.bind(this), this.state.render);
    this.updateGraph()
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


 ///////////////////////////////////////////////////////////////////////////////////////////////
  // Core of whole game is gameCycle function, which runs in regular intervals (this.state.render) and makes the game move - function moveDice
  gameCycle(aa,bb,custom="no"){

    if (this.state.autoplay){
      
      //makes number in right bottom change between 1 and 5 to animate autoplay
      var randomNumber = 4*(Math.ceil((Date.now()/1000))%2)+1
      this.setState({randomNumber})
      this.boxClicked()
 
  }  
 
  // update graph once in a while randomly, just to be sure
   if (Math.random()<0.02) {this.updateGraph()}

 // Each game cycle, one and only one move is made, move being single number increase. The moves are drawn from queue of moves. 

  var qq = this.state.queue;
  //if there are moves to be done in queue, do those moves. else carry on and do opponent moves
  if (qq.length > 0) {
     
        var next = qq.shift();
        this.moveDice (next[0], next[1],next[2],next[3])
    }

  else {
      this.setState({
        turn:true,
        bigturn: true,
      })

      if (this.state.allowOpponentMove){
          //if there is autoplay, also green has to play
          if (this.state.autoplay) {
              this.aiGreen();
          }

          //these AIs will play, each will add up moves to the queue, and then queue is processed move by move. If given AI has no single dice of its color on Dice anymore, it will simply not be able to play.
          this.aiRed();
          this.aiBlue();
          this.aiViolet();
          console.log("AI run");
          this.setState({allowOpponentMove : false})
      }
    }

  }
  
    //parametres are: 2 coordinates, color of given move (color is changing during explosion, when player is conquering surrounding squares. color is stored in state field c. source tells if move is exploding move, to animate it accordingly)
    moveDice(a,b,ccc,source="none")
          {
            if (source == "limegreen" && this.state.c[a][b] != "limegreen") {
              //If user clicked before the queue was emptied, his move was added to end of the queue, and now is being processed. 
              //But only is the color of that dice wasn't changed in a meanwhile
              //We will let user make another move
              this.setState({
                turn: true,
                bigturn: true,
                allowOpponentMove : false,
              });
              return;
            }

         

                //console.log("dice moved",a, b, ccc)

                if (source == "explode") {
                    this.colorBlink (a,b,"red")
                }

                else {
                    this.colorBlink (a,b,"white")
                }
                
                var boxValue = 1+this.state.p[a][b]; 
                var pp = this.state.p;
                var cc = this.state.c;
                pp[a][b] = boxValue
                cc[a][b] = ccc
                this.setState  ({
                  p : pp, 
                  c : cc,
                  turn : false
                })
              
                //if exploding, just pass forward the color of explosion (ccc) to know how to color surrounding squares 
                if (boxValue > 6 ) { this.explode (a,b,ccc)}

            
          }

  

    //handle explosion of 6 (it paints surrounding dices to my color and increase their number)
    explode (a,b,ccc) {

      console.log("dice explode ", a, b, ccc)
            var qq = this.state.queue;
            var cc = this.state.c;
            //var ccc = cc[a][b] //current color from c array
            var pp = this.state.p; //current number
            if (a>0) { qq.unshift([a-1,b,ccc,"explode"]) }
            if (b>0) { qq.unshift([a,b-1,ccc,"explode"]); }
            if (a<this.state.sizey-1) { qq.unshift([a+1,b,ccc,"explode"]); }
            if (b<this.state.sizex-1) { qq.unshift([a,b+1,ccc,"explode"]); }
              
         
              pp[a][b] = "✸";    
              this.setState ({
                p : pp,
                queue : qq
              })
              
              setTimeout(() => {
                pp = this.state.p;
                pp[a][b] = 1;    
              this.setState ({
                p : pp,
                queue : qq
              })
              },50)
            
        }

    

 // these functions are called during change of difficulty, also when game is reset and board redrawned

  easy() {

    localStorage.setItem('difficulty', 1);

    this.setState({
      easy: "yellow",
      medium: "white",
      hard: "white",
      imbaColor: "black",
      imba: "white",
      info: 2

    })

    setTimeout(() => {
      this.updateGraph()
    }, 25)
  }



 
  medium(){

    localStorage.setItem('difficulty', 2);

    var cc = this.state.c;
    var pp = this.state.p;

    if (this.state.version == "Big") {
      pp[3][2] = 6;
      cc[3][2] = "royalblue";
    }
    else {
      pp[5][7] = 6;
      cc[5][7] = "royalblue";
  }
        
    this.setState({
      easy: "white",
      medium: "limegreen",
      hard: "white",
      imbaColor: "black",
      imba: "white",
      info: 2

    })

    setTimeout(() => {
      this.updateGraph()
    }, 25)
  }

  hard() {

    localStorage.setItem('difficulty', 3);

    var cc = this.state.c;
    var pp = this.state.p;

    if (this.state.version == "Big") {
      pp[2][3] = 6;
      cc[2][3] = "violet";
      pp[3][2] = 6;
      cc[3][2] = "royalblue";
    }
    else {
      pp[3][13] = 6;
      cc[3][13] = "violet";
      pp[5][7] = 6;
      cc[5][7] = "royalblue";
    }

    this.setState({
      easy: "white",
      medium: "white",
      hard: "red",
      imbaColor: "black",
      imba: "white",
      info: 1.5,
      c: cc,
    })

    setTimeout(() => {
      this.updateGraph()
    }, 25)
  }

  
  imba(){

    localStorage.setItem('difficulty', 4);

    var cc = this.state.c;
    var pp = this.state.p;

    if (this.state.version == "Big") {
      pp[2][3] = 6;
      cc[2][3] = "orchid";
      pp[3][2] = 6;
      cc[3][2] = "royalblue";
    }
    else {
      pp[3][13] = 6;
      cc[3][13] = "orchid";
      pp[5][7] = 6;
      cc[5][7] = "royalblue";
    }

    this.setState({
      easy: "white",
      medium: "white",
      hard: "white",
      imbaColor: "white",
      imba: "black",
      info: 2,
      c: cc,
    })

    setTimeout(() => {
      this.updateGraph()
    }, 25)
  }
 

    setSpeed (event) {
      this.setState ( {
        render : 210-2*event.target.value})

        clearInterval( this.interval);
        this.interval = setInterval(this.gameCycle.bind(this), this.state.render);
        this.updateGraph()
      }
  
  

    componentWillMount () {
      this.versionChange();
      var difficulty = localStorage.getItem('difficulty');
      console.log("difficulty: ",difficulty);
      }


  drawBoard(size){

    localStorage.setItem('version', size);
    
    this.setState({
      easy: "yellow",
      medium: "white",
      hard: "white",
      imbaColor: "black",
      imba: "white",
      info : 2,
      black: 0,
      red: 0,
      green: 1,
      silver: 0,
      violet: 0,
      royalblue: 0,
      queue: [],
      allowOpponentMove: false,
    })

    var x = 14;
    var y = 8;

    if (size == "Big"){
      
      var c = Array(y).fill().map(_ => 
        Array(x).fill().map(_ => "red" ) );
        c[1][1] = "limegreen";
       
        c[4][3] = "red";
        console.log(c)

        var d = Array(y).fill().map(_ => 
          Array(x).fill().map(_ => "#111" ) );

          var p = Array(y).fill().map(_ => 
            Array(x).fill().map(_ => Math.ceil(5*Math.random())) );
               p[1][1] = Math.ceil(5*Math.random())
              
                p[4][3] = Math.ceil(5*Math.random())
               


      this.setState ({
        sizex:x,
        sizey:y,
        version:"Small",
       p, c, d
      })
    }

    else {
      
      var c = Array(y).fill().map(_ => 
        Array(x).fill().map(_ => "red" ) );
            c[1][1] = "limegreen";
            c[0][1] = "limegreen";
            c[1][0] = "limegreen";
            c[0][0] = "limegreen";
            c[3][3] = "red";
            c[3][4] = "red";
            c[4][3] = "red";
            c[4][4] = "red";
          
            var d = Array(y).fill().map(_ => 
              Array(x).fill().map(_ => "#111" ) );

              var p = Array(y).fill().map(_ => 
                Array(x).fill().map(_ => 0) );
                  p[1][1] = Math.ceil(5*Math.random())
                  p[0][1] = Math.ceil(5*Math.random())
                    p[1][0] = Math.ceil(5*Math.random())
                    p[0][0] = Math.ceil(5*Math.random())
                    p[3][3] = 1
                    p[3][4] = Math.ceil(5*Math.random())
                    p[4][3] = Math.ceil(5*Math.random())
                    p[4][4] = Math.ceil(5*Math.random())  
        

      var c = Array(y).fill().map(_ =>
        Array(x).fill().map(_ => "red"));
      c[1][1] = "limegreen";
      c[0][1] = "limegreen";
      c[1][0] = "limegreen";
      c[0][0] = "limegreen";
      c[3][3] = "red";
      c[3][4] = "red";
      c[4][3] = "red";
      c[4][4] = "red";

      var d = Array(y).fill().map(_ =>
        Array(x).fill().map(_ => "#111"));

      var p = Array(y).fill().map(_ =>
        Array(x).fill().map(_ => 0));
      p[1][1] = Math.ceil(5 * Math.random())
      p[0][1] = Math.ceil(5 * Math.random())
      p[1][0] = Math.ceil(5 * Math.random())
      p[0][0] = Math.ceil(5 * Math.random())
      p[3][3] = 1
      p[3][4] = Math.ceil(5 * Math.random())
      p[4][3] = Math.ceil(5 * Math.random())
      p[4][4] = Math.ceil(5 * Math.random())

      this.setState({
        sizex: 5,
        sizey: 5,
        version: "Big",

        c,
        p,
        d,
      })
      };

      

      setTimeout(() => {

        var difficulty = localStorage.getItem('difficulty');

        if (difficulty == 1) {this.easy();}
        if (difficulty == 2) {this.medium();}
        if (difficulty == 3) {this.hard();}
        if (difficulty == 4) {this.imba();}
      
      
      
      } ,15);

      setTimeout(() => {
        
        this.setState({ 
          queue: [],
          allowOpponentMove: false,
        });
        this.updateGraph(); 
      } ,75) 
  }




  versionChange(){
    if (this.state.version == "Big") {
      this.drawBoard ("Big")   }
    else {
      this.drawBoard ("Small")
    }
  }

  reset (){
    if (this.state.version == "Big") {
      this.drawBoard ("Small")   }
    else {
      this.drawBoard ("Big")
    }    

    
  }
  
  changeDice() {
      if (this.state.dice == "dice"){
          this.setState({
          dice: "number",
          diceClass:"number5"});
          localStorage.setItem("dice","number")

      }  
      else {
        this.setState({
          dice: "dice",
          diceClass:"dice5"});
          localStorage.setItem("dice","dice")
      }
  }

  // generation of play field in 3 functions bellow
  makeButtonOne (a,b) {
      
    if (this.state.dice == "dice") {
    var buttonOne =
      <div> 
    <button className="stlpec dice" 
    style={{backgroundColor:this.state.c[a][b],  color: this.state.d[a][b], fontSize: this.state.diceGrid[a][b]}} 
    onClick={e => this.boxClicked(e, a, b)}> 
    {this.state.p[a][b]} 
    </button>
      </div>}
    else {
      var buttonOne =
      <div> 
    <button className="stlpec number" 
    style={{backgroundColor:this.state.c[a][b], color: this.state.d[a][b], fontSize: this.state.buttonGrid[a][b]}}
    onClick={e => this.boxClicked(e, a, b)}> 
    {this.state.p[a][b]} 
    </button>
      </div>
    }
    
      return buttonOne

  }

  makeButtonLine (a) {

    const arr = [];
    for (let i=0; i<this.state.sizex; i++) {
      arr.push(this.makeButtonOne (a,i))
    }
    
      var x = 
      <div className="riadok" style={{width: 70*this.state.sizex}}>
       {arr}
      </div>
      
      return x
  }

  makeSquare (){
      const arr2 = [];
      for (let y=0; y<this.state.sizey; y++) {
        arr2.push(this.makeButtonLine(y))
      }

      return arr2;



  }

  render() {
    
    //switch between small and big version
    var versionSpan = <span className="version" onClick={this.versionChange}>{this.state.version}</span>
    
    //change speed of dice moves
    var rangeSpan =  <span className="rangespan"> <input type="range" step="20" defaultValue="60" style = {{width:"65px"}}onChange={this.setSpeed} /></span>

    //intro is the first line, changing between instructions, win or lose statement.
    var intro;
    if (this.state.green == this.state.sizex*this.state.sizey) {
      intro = 
      <div className = "riadok intro">
      <span style={{fontSize:45, color:"green"}}>YOU WON!</span>{versionSpan}
      </div>
    }
    else  {if (this.state.green == 0) {
      intro = 
      <div className = "riadok intro">
      <span style={{fontSize:45, color:"red"}}>YOU LOST!</span>{versionSpan}
      </div>
    } else
    {
      if (this.state.turn) {
        intro = 
        <div className = "riadok intro">
        You are <span style={{color:"green"}}>green</span>. Conquer <br/>the whole area to win.{versionSpan}
        </div>
      }
      else
      {
        intro = 
        <div className = "riadok intro">
        You are <span style={{color:"darkred"}}>green</span>. Conquer <br/>the whole area to win.{versionSpan}
        </div>
      
      }
    }}

    //visitors counter
    var counter = 
    <div>       
    <a href="http://www.simple-counter.com/" target="_blank"><img src="http://www.simple-counter.com/hit.php?id=zveaxcq&nd=8&nc=11&bc=4" border="0" alt="Hit Counter" /></a>
    </div>

          {
            this.makeSquare()
          }

    //in graph I am only showing the colored spans of those players who are in game. when updating graph, I count that and fill visible array
    var graph1 = <div style={{height:18, width:70*this.state.green/this.state.sizey}} className="stlpec green"></div>
    var graph2 = <div style={{visibility:this.state.visible[1], height:18, width:(70/this.state.sizey)*this.state.red}} className="stlpec red"></div>
    var graph3 = <div style={{visibility:this.state.visible[2], height:18, width:(70/this.state.sizey)*this.state.royalblue}} className="stlpec royalblue"></div>
    var graph4 = <div style={{visibility:this.state.visible[3], height:18, width:(70/this.state.sizey)*this.state.violet}} className="stlpec violet"></div>
    var graph5 = <div style={{visibility:this.state.visible[4], height:18, width:(70/this.state.sizey)*this.state.orchid}} className="stlpec orchid"></div>

    var g = []

    if (this.state.visible[0] == "visible") {g.push(graph1)}
    if (this.state.visible[1] == "visible") {g.push(graph2)}
    if (this.state.visible[2] == "visible") {g.push(graph3)}
    if (this.state.visible[3] == "visible") {g.push(graph4)}
    if (this.state.visible[4] == "visible") {g.push(graph5)}

      var graph = 
      <div className = "graph">
          {g}
      </div>

    return (
      <div className="App" style={{width:70*this.state.sizex}}>
        
        {/* Headline to show if you win or lost or introduction */}
        {intro}
          
        {/* This prints a board */}  
        {this.makeSquare()}
        
        
    
        
        <div className = "">
        <div className = "difficulty">
          <span >Difficulty:</span>
          {rangeSpan}
          <span className="autoplay">
          <label>Autoplay 
            <input name="autoplay"
            type="checkbox" 
            checked={this.state.autoplay}
            onChange={this.handleAutoplay} />
            </label>
            </ span>

        </div>
          <button title="1 opponent who has 2 moves. No intelligence." className="difficultyButton" style={{backgroundColor:this.state.easy}} onClick={this.easy} > EASY </button>
          <button title="2 opponents having 2 moves each. Blue will go after 6s first." className="difficultyButton" style={{backgroundColor:this.state.medium}} onClick={this.medium} > MEDIUM </button>
          <button title="Red has 2 moves, blue and violet 1.5 moves each. Violet will only play at the borders, prefer to go after 5s and 6s and advance from left top to right bottom." className="difficultyButton" style={{backgroundColor:this.state.hard}} onClick={this.hard} > HARD </button>
          <button title="All 3 opponents have 2 moves each." className="difficultyButton imba" style={{backgroundColor:this.state.imba, color:this.state.imbaColor}} onClick={this.imba} > IMBA </button>
        </div>

         {/* Shows current game score as a graph . visibile is an array to store whethere this player is still in game(visible) or not (hidden)*/}
        {graph}
        
        <div className="resetContainer">
             {/* Resets the whole game by simply reloading the page */}
            <div className = "reset" onClick={this.reset}>RESET</div>
             {/* Chages graphics, between numberic or dice looking numbers */}
            <div className={this.state.diceClass} title="Switch graphics" onClick={this.changeDice}>{this.state.randomNumber}</div>
        </div>
        

  <div  className = "signature">
         <div className="counter">        {counter}
        </div>
        
         <div><a href="https://github.com/justdvl" target="blank">© 2018 David Vendel</a></div>
        </div>

        <div className = "info">
        Firing {this.state.info} at once

       
        </div>
        

      </div>
    );
  }
}

export default App;