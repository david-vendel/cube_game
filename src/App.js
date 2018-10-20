import React, { Component } from 'react';

import './App.css';
import { white } from 'ansi-colors';


class App extends Component {
  constructor(props){
    super (props);
   

      var sizex = 5;
      var sizey = 5;

      var version = localStorage.getItem('version');

      var c = Array(sizey).fill().map(_ => 
        Array(sizex).fill().map(_ => "" ) );
        c[1][1] = "limegreen";
        c[0][1] = "limegreen";
        c[1][0] = "limegreen";
        c[0][0] = "limegreen";
        
        c[3][3] = "red";
        c[3][4] = "red";
        c[4][3] = "re";
        c[4][4] = "red";

        console.log(c)

    this.state = {
      turn: true,
      green:1,
      royalblue:1,
      violet:1,
      p : Array(sizey).fill().map(_ => 
        Array(sizex).fill().map(_ => 0) ),  
        c,
          
          d: Array(sizey).fill().map(_ => 
            Array(sizex).fill().map(_ => "white" ) ), 
      easy : "yellow",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info : 2,
      sizex,
      sizey,
      render : 1,
      version : version,
      counting: 1,
      autoplay: false,
      speed:100,
      black:16,
      orchid:0,
      silver:0,
      queue = [],
    }
    this.boxClicked = this.boxClicked.bind(this)
    this.me = this.me.bind(this)
    this.easy = this.easy.bind(this)
    this.medium = this.medium.bind(this)
    this.hard = this.hard.bind(this)
    this.imba = this.imba.bind(this)
    this.vlcek = this.vlcek.bind(this)
    this.versionChange = this.versionChange.bind(this)
    this.handleAutoplay = this.handleAutoplay.bind(this)
    this.setSpeed = this.setSpeed.bind(this)

    
  }
 
  handleAutoplay (){
    this.setState({
      autoplay: !this.state.autoplay
    })

  }
  colorBlink (a,b) {
    var dd = this.state.d;
    dd[a][b] = "white";
    this.setState({
      d:dd
    })  
    

    setTimeout(() => {
      var dd = this.state.d;
      dd[a][b] = "black";
      this.setState({
        d:dd
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
      orchid
    })
  }

  boxClicked(event, a, b) {





    if (!this.state.autoplay){


          console.log("click")
            if (this.state.c[a][b] != "limegreen") {return}

            if (!this.state.turn) {return
              }

            for (var y=0; y<this.state.sizey; y++) {
                for (var i=0; i<this.state.sizex; i++) {
                    if (this.state.p[y][i] > 6){return}
                }}
        
            
                var boxValue = 1+this.state.p[a][b];
                  
                var pp = this.state.p;
                pp[a][b] = boxValue
                this.setState  ({
                  p : pp, 
                  turn : false
                })
      
              } else {
  //AI green
 
  for (let ig = 1; ig <= this.state.info; ig++) {
    setTimeout(() => {
  
      for (var y=0; y<this.state.sizey; y++) {
        for (var yy=0; yy<this.state.sizex; yy++) {
            if (this.state.p[y][yy] > 6){
              this.changeActiveMedia(y,yy,"yes"); i-=1; continue;}
        }}
  
  
          var omg = 9999;
          
          while (omg>0) {
                var a2=Math.floor(this.state.sizey*Math.random())
                var b2=Math.floor(this.state.sizex*Math.random())
                if (this.state.c[a2][b2] == "limegreen") {
                    this.colorBlink (a2,b2);
                    var pp = this.state.p;
                    pp[a2][b2] += 1;
                    this.setState ({
                      p : pp
                    }) 
                    omg = 0;
                }
                omg -= 1;
          }
    }, 89*ig) 
    
            //AI green
          }
        }

 //AI red
     
 for (let i = 1; i <= this.state.info; i++) {
  setTimeout(() => {

    for (var y=0; y<this.state.sizey; y++) {
      for (var yy=0; yy<this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6){
             this.changeActiveMedia(y,yy,"yes"); i-=1; continue;}
      }}


        var om = 99;
        
        while (om>0) {
              var a2=Math.floor(this.state.sizey*Math.random())
              var b2=Math.floor(this.state.sizex*Math.random())
              if (this.state.c[a2][b2] == "red") {
                  this.colorBlink (a2,b2);
                  var pp = this.state.p;
                  pp[a2][b2] += 1;
                  this.setState ({
                    p : pp
                  }) 
                  if (this.state.info == 1.5) {om -=50;}
                  else {om = 0;}
              }
              om -= 1;
        }
  }, 119*i) 
  }
          //AI red


 //AI blue
     
 for (let ib = 1; ib <= this.state.info; ib++) {

  
  setTimeout(() => {

    for (var y=0; y<this.state.sizey; y++) {
      for (var yy=0; yy<this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6){
             this.changeActiveMedia(y,yy,"yes"); i-=1; continue;}
      }}


        var omb = 9999;
        
      
        for (let y9=0; y9<this.state.sizey; y9++) {
          
          for (let yy9=0; yy9<this.state.sizex; yy9++) {
              if (this.state.p[y9][yy9] === 6 && this.state.c[y9][yy9] === "royalblue"){
                console.log("6")
                this.colorBlink (y9,yy9);
                var pp = this.state.p;
                pp[y9][yy9] += 1;
                this.setState ({
                  p : pp
                }) 
                if (omb>100 && this.state.info == 1.5) {omb = 100;} else {
                  omb = 0; break;}
              }
          }}


        while (omb>0) {
              var a2=Math.floor(this.state.sizey*Math.random())
              var b2=Math.floor(this.state.sizex*Math.random())
              if (this.state.c[a2][b2] == "royalblue") {
                  this.colorBlink (a2,b2);
                  var pp = this.state.p;
                  pp[a2][b2] += 1;
                  this.setState ({
                    p : pp
                  }) 
                  omb = 0;
              }
              omb -= 1;
        }
  }, 149*ib) 
  }
          //AI blue



 //AI violet
     
 for (let ic = 1; ic <= this.state.info; ic++) {
  setTimeout(() => {

    for (var y=0; y<this.state.sizey; y++) {
      for (var yy=0; yy<this.state.sizex; yy++) {
          if (this.state.p[y][yy] > 6){
             this.changeActiveMedia(y,yy,"yes"); i-=1; continue;}
      }}


        var omc = 9999;
        
        
        for (let y9=0; y9<this.state.sizey; y9++) {
          
          for (let yy9=0; yy9<this.state.sizex; yy9++) {
              if (this.state.p[y9][yy9] === 6 && (this.state.c[y9][yy9] === "orchid" || this.state.c[y9][yy9] === "violet") ){
                console.log("6")
                this.colorBlink (y9,yy9);
                var pp = this.state.p;
                pp[y9][yy9] += 1;
                this.setState ({
                  p : pp
                }) 
                if (omc>100 && this.state.info == 1.5) {omc = 100;} else {
                omc = 0; break; }
              }
          }}


        while (omc>0) {
              var a2=Math.floor(this.state.sizey*Math.pow(Math.random(),2))
              var b2=Math.floor(this.state.sizex*Math.pow(Math.random(),2))
              if ((Math.random()>0.8 || this.state.p[a2][b2] > 4) && (this.state.c[a2][b2] == "orchid" && ((a2+1<this.state.sizey && this.state.c[a2+1][b2] != "orchid") || (b2+1<this.state.sizex && this.state.c[a2][b2+1] != "orchid") || (a2 > 0 && this.state.c[a2-1][b2] != "orchid") || (b2>0 && this.state.c[a2][b2-1] != "orchid")) || this.state.c[a2][b2] == "violet" && ((a2+1<this.state.sizey && this.state.c[a2+1][b2] != "violet") || (b2+1<this.state.sizex && this.state.c[a2][b2+1] != "violet") || (a2 > 0 && this.state.c[a2-1][b2] != "violet") || (b2>0 && this.state.c[a2][b2-1] != "violet")))  ) {
                  this.colorBlink (a2,b2);
                  var pp = this.state.p;
                  pp[a2][b2] += 1;
                  this.setState ({
                    p : pp
                  }) 
                  omc = 0;
              }
              omc -= 1;
        }
  }, 177*ic) 
  }
          //AI violet

         
      

          setTimeout (() => {
              this.setState({
                turn : true
              });
          }, this.state.info*100+50)



      

      }

  
  componentDidMount() {
    setInterval(this.changeActiveMedia.bind(this), this.state.render);
    this.updateGraph()
  }

  changeActiveMedia(aa,bb,custom="no"){

    if (this.state.autoplay){
      
      var foo = 1 + this.state.counting;
    if (foo >this.state.speed) {
      this.boxClicked()
      this.setState ({
        counting:0
      })

   
    }
    else  {
    
    this.setState ({
      counting : foo
    })
  }  
   }
   if (Math.random()<0.002) {this.updateGraph()}


    var a;
    var b;
    //for (var y=0; y<4; y++) {
     // for (var i=0; i<4; i++) {
        a=Math.floor(this.state.sizey*Math.random())
        b=Math.floor(this.state.sizex*Math.random())
        if (custom=="yes") {a = aa};
        if (custom=="yes") {b = bb};
       
        if (this.state.p[a][b] > 6) {
          var cc = this.state.c;
          var ccc = cc[a][b] //current color from c array
          var pp = this.state.p;
          if (a>0) {pp[a-1][b] += 1; cc[a-1][b] = ccc}
          if (a<this.state.sizey-1) {pp[a+1][b] += 1; cc[a+1][b] = ccc}
          if (b<this.state.sizex-1) {pp[a][b+1] += 1; cc[a][b+1] = ccc}
          if (b>0) {pp[a][b-1] += 1; cc[a][b-1] = ccc}
  
          pp[a][b] = 1;
  
          this.setState ({
            p : pp
          })
        }

        for (var y=0; y<this.state.sizey; y++) {
          for (var i=0; i<this.state.sizex; i++) {
            if (this.state.c[a][b] == "white") {
              var cc3 = this.state.c;
              cc3[a][b] = "red";
              this.setState({c:cc3})
            }
          }
        }

     //   }
     // }
    

   
    
  }

  me(event) {
    event.target.style.backgroundColor = "white";
  }

  ml(event) {
    event.target.style.backgroundColor = "red";
  }

  easy(){

    localStorage.setItem('difficulty', 1);

    this.setState({
      easy: "yellow",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 2

    })

    setTimeout(() => {this.updateGraph()} ,25) 
  }
  medium(){
    console.log("function medium")

    var cc = this.state.c;
    var pp = this.state.p;
    
    if (this.state.version == "Big") {
      pp[3][2] = 6;
      cc[3][2] = "royalblue";}
  else {
      pp[5][7] = 6;
      cc[5][7] = "royalblue";
  }

  localStorage.setItem('difficulty', 2);
        
    this.setState({
      easy: "white",
      medium : "limegreen",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 2

    })

    setTimeout(() => {this.updateGraph()} ,25) 
  }


  hard(){

    localStorage.setItem('difficulty', 3);

    var cc = this.state.c;
    var pp = this.state.p;

    if (this.state.version == "Big") {
        pp[2][3] = 6;
        cc[2][3] = "violet";
        pp[3][2] = 6;
        cc[3][2] = "royalblue";}
    else {
        pp[3][13] = 6;
        cc[3][13] = "violet";
        pp[5][7] = 6;
        cc[5][7] = "royalblue";
    }

    this.setState({
      easy: "white",
      medium : "white",
      hard : "red",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 1.5,
      c:cc,
    })

    setTimeout(() => {this.updateGraph()} ,25) 
  }
  imba(){

    localStorage.setItem('difficulty', 4);

    var cc = this.state.c;
    var pp = this.state.p;

    if (this.state.version == "Big") {
      pp[2][3] = 6;
      cc[2][3] = "orchid";
      pp[3][2] = 6;
      cc[3][2] = "royalblue";}
  else {
      pp[3][13] = 6;
      cc[3][13] = "orchid";
      pp[5][7] = 6;
      cc[5][7] = "royalblue";
  }

    this.setState({
      easy: "white",
      medium : "white",
      hard : "white",
      imbaColor: "white",
      imba: "black",
      vlcek: "white",
      info: 2,
      c:cc,
    })

    setTimeout(() => {this.updateGraph()} ,25) 
  }
  vlcek(){
    this.setState({
      easy: "white",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      info: 5,
      vlcek: "purple"
    })
  }

  setSpeed (event) {
    this.setState ( {
      speed : 220-2*event.target.value})
    }

    componentWillMount () {
      this.versionChange();
      var difficulty = localStorage.getItem('difficulty');
      console.log("difficulty: ",difficulty);

      

    }

  versionChange(){

    localStorage.setItem('version', this.state.version);
    
    
    this.setState({
      easy : "yellow",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info : 2,
      black: 0,
      red: 1,
      green: 1,
      silver: 0,
      violet: 0,
      royalblue: 0,
    })

    var x = 14;
    var y = 8;

    if (this.state.version == "Big"){
      
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
        


      this.setState ({
        sizex:5,
        sizey:5,
        version:"Big",
        
          c,
            p,
          d, 
      })
    }

   setTimeout(() => {this.updateGraph()} ,25) 
  }

  makeButtonOne (a,b) {
      
    if (this.state.c[a][b] == "#eee") {
    var buttonOne =
      <div> 
    <button className="stlpec stlpec1" 
    style={{backgroundColor:this.state.c[a][b], color:"#eee"}} 
    onClick={e => this.boxClicked(e, a, b)}> 
    {this.state.p[a][b]} 
    </button>
      </div>}
    else {
      var buttonOne =
      <div> 
    <button className="stlpec stlpec1" 
    style={{backgroundColor:this.state.c[a][b], color: this.state.d[a][b]}} 
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
    
    var versionSpan = <span className="version" onClick={this.versionChange}>{this.state.version}</span>
    
    var rangeSpan =  <span className="rangespan"> <input type="range" step="1" defaultValue="50" style = {{width:"65px"}}onChange={this.setSpeed} /></span>

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
      intro = 
      <div className = "riadok intro">
      You are <span style={{color:"green"}}>green</span>. Conquer <br/>the whole area to win.{versionSpan}
      </div>
    }}

    var counter = 
    <div>       
    <a href="http://www.simple-counter.com/" target="_blank"><img src="http://www.simple-counter.com/hit.php?id=zveaxcq&nd=8&nc=11&bc=4" border="0" alt="Hit Counter" /></a>
    </div>



    return (
      <div className="App" style={{width:70*this.state.sizex}}>
        {intro}
          
           {this.makeSquare()}
        
        
    
        
        <div className = "">
        <div className = "difficulty">
          <span title="Difficulty">Difficulty:</span>
          {rangeSpan}
          <span className="autoplay">
          <label>Autoplay 
            <input name="autoplay"
            type="checkbox" 
            checked={this.state.autoplay}
            onChange={this.handleAutoplay} />
            </label>
            </ span>
          
          {/*<button className="difficultyButton vlcek" style={{backgroundColor:this.state.vlcek}} onClick={this.vlcek} > Vlcek </button>*/}

        </div>
          <button title="1 opponent who has 2 moves. No intelligence." className="difficultyButton" style={{backgroundColor:this.state.easy}} onClick={this.easy} > EASY </button>
          <button title="2 opponents having 2 moves each. Blue will go after 6s first." className="difficultyButton" style={{backgroundColor:this.state.medium}} onClick={this.medium} > MEDIUM </button>
          <button title="Red has 2 moves, blue and violet 1.5 moves each. Violet will only play at the borders, prefer to go after 5s and 6s and advance from left top to right bottom." className="difficultyButton" style={{backgroundColor:this.state.hard}} onClick={this.hard} > HARD </button>
          <button title="All 3 opponents have 2 moves each." className="difficultyButton imba" style={{backgroundColor:this.state.imba, color:this.state.imbaColor}} onClick={this.imba} > IMBA </button>
        </div>

        <div className = "">
        <div style={{height:18, width:70*this.state.green/this.state.sizey}} className="stlpec green"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.red}} className="stlpec red"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.royalblue}} className="stlpec royalblue"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.violet}} className="stlpec violet"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.black}} className="stlpec black"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.orchid}} className="stlpec orchid"></div>
        <div style={{height:18, width:(70/this.state.sizey)*this.state.silver}} className="stlpec silver"></div>
        </div>
        <a href = "">
        <div  className = "reset">
            <div>RESET</div>
        </div>
        </a>

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
