import React, { Component } from 'react';

import './App.css';
import { white } from 'ansi-colors';


class App extends Component {
  constructor(props){
    super (props);

    this.state = {
      turn: true,
      green:1,
      p : [[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]],
      c : [["red","red","red","red","red"],["red","red","red","red","red"],["red","lightgreen","red","red","red"],["red","red","red","red","red"],["red","red","red","red","red"]],
      d : [["black", "black", "black","black", "black"],["black", "black", "black","black", "black"],["black", "black", "black","black", "black"],["black", "black", "black","black", "black"],["black", "black", "black","black", "black"]],
      easy : "white",
      medium : "limegreen",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info : 2
    }
    this.boxClicked = this.boxClicked.bind(this)
    this.me = this.me.bind(this)
    this.easy = this.easy.bind(this)
    this.medium = this.medium.bind(this)
    this.hard = this.hard.bind(this)
    this.imba = this.imba.bind(this)
    this.vlcek = this.vlcek.bind(this)

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

  }

  boxClicked(event, a, b) {

      if (this.state.c[a][b] == "red") {return}

      if (!this.state.turn) {
        return}

      for (var y=0; y<5; y++) {
          for (var i=0; i<5; i++) {
              if (this.state.p[y][i] > 6){return}
          }}
      
      
          var boxValue = 1+this.state.p[a][b];
            
          var pp = this.state.p;
          pp[a][b] = boxValue
          this.setState  ({
            p : pp, 
            turn : false
          })


 //AI
     
 for (let i = 1; i <= this.state.info; i++) {
  setTimeout(() => {

    for (var y=0; y<5; y++) {
      for (var yy=0; yy<5; yy++) {
          if (this.state.p[y][yy] > 6){this.changeActiveMedia(y,yy); i-=1; break;}
      }}


        var om = 99;
        
        while (om>0) {
              var a2=Math.floor(5*Math.random())
              var b2=Math.floor(5*Math.random())
              if (this.state.c[a2][b2] == "red") {
                  this.colorBlink (a2,b2);
                  var pp = this.state.p;
                  pp[a2][b2] += 1;
                  this.setState ({
                    p : pp
                  }) 
                  om = 0;
              }
              om -= 1;
        }
  }, 100*i) 
  }

 
      

     

       
          
  
          //AI
          setTimeout (() => {
              this.setState({
                turn : true
              });
          }, 500)



      
      }

  
  componentDidMount() {
    setInterval(this.changeActiveMedia.bind(this), 1);
    
  }

  changeActiveMedia(aa,bb){
    var a;
    var b;
    //for (var y=0; y<4; y++) {
     // for (var i=0; i<4; i++) {
        a=Math.floor(5*Math.random())
        b=Math.floor(5*Math.random())
        if (aa) a = aa;
        if (bb) b = bb;
        
        if (this.state.p[a][b] > 6) {
          var cc = this.state.c;
          var ccc = cc[a][b] //current color from c array
          var pp = this.state.p;
          if (a>0) {pp[a-1][b] += 1; cc[a-1][b] = ccc}
          if (a<4) {pp[a+1][b] += 1; cc[a+1][b] = ccc}
          if (b<4) {pp[a][b+1] += 1; cc[a][b+1] = ccc}
          if (b>0) {pp[a][b-1] += 1; cc[a][b-1] = ccc}
  
          pp[a][b] = 1;
  
          this.setState ({
            p : pp
          })
        }

        for (var y=0; y<5; y++) {
          for (var i=0; i<5; i++) {
            if (this.state.c[a][b] == "white") {
              var cc3 = this.state.c;
              cc3[a][b] = "red";
              this.setState({c:cc3})
            }
          }
        }

     //   }
     // }

     var green = 0;
    for (var r=0; r<5; r++){
      for (var s=0; s<5; s++)
        {
          if (this.state.c[r][s] == "lightgreen") {green += 1}
        }
    }
    this.setState({
      green
    })

  }

  me(event) {
    event.target.style.backgroundColor = "white";
  }

  ml(event) {
    event.target.style.backgroundColor = "red";
  }

  easy(){
    this.setState({
      easy: "yellow",
      medium : "white",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 1

    })
  }
  medium(){
    this.setState({
      easy: "white",
      medium : "limegreen",
      hard : "white",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 2

    })
  }
  hard(){
    this.setState({
      easy: "white",
      medium : "white",
      hard : "red",
      imbaColor: "black",
      imba: "white",
      vlcek: "white",
      info: 3

    })
  }
  imba(){
    this.setState({
      easy: "white",
      medium : "white",
      hard : "white",
      imbaColor: "white",
      imba: "black",
      vlcek: "white",
      info: 4

    })
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



  render() {
    

    var intro;
    if (this.state.green == 25) {
      intro = 
      <div className = "riadok intro">
      <span style={{fontSize:45, color:"green"}}>YOU WON!</span>
      </div>
    }
    else  {if (this.state.green == 0) {
      intro = 
      <div className = "riadok intro">
      <span style={{fontSize:45, color:"red"}}>YOU LOST!</span>
      </div>
    } else
    
    {
      intro = 
      <div className = "riadok intro">
      You are <span style={{color:"green"}}>green</span>. Conquer the whole area to win.
      </div>
    }}

    var counter = 
    <div>
       
    <a href="http://www.simple-counter.com/" target="_blank"><img src="http://www.simple-counter.com/hit.php?id=zveaxcq&nd=8&nc=11&bc=4" border="0" alt="Hit Counter" /></a>
         
        

    </div>

    return (
      <div className="App">
        {intro}
        <div className = "riadok riadok1">
       
            <button className="stlpec stlpec1" style={{backgroundColor:this.state.c[0][0], color:this.state.d[0][0]}} onClick={e => this.boxClicked(e, 0, 0)}> {this.state.p[0][0]} </button>
            <button className="stlpec stlpec2" style={{backgroundColor:this.state.c[0][1], color:this.state.d[0][1]}} onClick={e => this.boxClicked(e, 0, 1)}> {this.state.p[0][1]} </button>
            <button className="stlpec stlpec3" style={{backgroundColor:this.state.c[0][2], color:this.state.d[0][2]}} onClick={e => this.boxClicked(e, 0, 2)}> {this.state.p[0][2]} </button>
            <button className="stlpec stlpec4" style={{backgroundColor:this.state.c[0][3], color:this.state.d[0][3]}} onClick={e => this.boxClicked(e, 0, 3)}> {this.state.p[0][3]} </button>
            <button className="stlpec stlpec5" style={{backgroundColor:this.state.c[0][4], color:this.state.d[0][4]}} onClick={e => this.boxClicked(e, 0, 4)}> {this.state.p[0][4]} </button>
        </div>
        
        <div className = "riadok riadok2">
            <button className="stlpec stlpec1" style={{backgroundColor:this.state.c[1][0], color:this.state.d[1][0]}} onClick={e => this.boxClicked(e, 1, 0)}> {this.state.p[1][0]} </button>
            <button className="stlpec stlpec2" style={{backgroundColor:this.state.c[1][1], color:this.state.d[1][1]}} onClick={e => this.boxClicked(e, 1, 1)}> {this.state.p[1][1]} </button>
            <button className="stlpec stlpec3" style={{backgroundColor:this.state.c[1][2], color:this.state.d[1][2]}} onClick={e => this.boxClicked(e, 1, 2)}> {this.state.p[1][2]} </button>
            <button className="stlpec stlpec4" style={{backgroundColor:this.state.c[1][3], color:this.state.d[1][3]}} onClick={e => this.boxClicked(e, 1, 3)}> {this.state.p[1][3]} </button>
            <button className="stlpec stlpec5" style={{backgroundColor:this.state.c[1][4], color:this.state.d[1][4]}} onClick={e => this.boxClicked(e, 1, 4)}> {this.state.p[1][4]} </button>
        </div>

        <div className = "riadok riadok3">
            <button className="stlpec stlpec1" style={{backgroundColor:this.state.c[2][0], color:this.state.d[2][0]}} onClick={e => this.boxClicked(e, 2, 0)}> {this.state.p[2][0]} </button>
            <button className="stlpec stlpec2" style={{backgroundColor:this.state.c[2][1], color:this.state.d[2][1]}} onClick={e => this.boxClicked(e, 2, 1)}> {this.state.p[2][1]} </button>
            <button className="stlpec stlpec3" style={{backgroundColor:this.state.c[2][2], color:this.state.d[2][2]}} onClick={e => this.boxClicked(e, 2, 2)}> {this.state.p[2][2]} </button>
            <button className="stlpec stlpec4" style={{backgroundColor:this.state.c[2][3], color:this.state.d[2][3]}} onClick={e => this.boxClicked(e, 2, 3)}> {this.state.p[2][3]} </button>
            <button className="stlpec stlpec5" style={{backgroundColor:this.state.c[2][4], color:this.state.d[2][4]}} onClick={e => this.boxClicked(e, 2, 4)}> {this.state.p[2][4]} </button>
        </div>

        <div className = "riadok riadok4">
            <button className="stlpec stlpec1" style={{backgroundColor:this.state.c[3][0], color:this.state.d[3][0]}} onClick={e => this.boxClicked(e, 3, 0)}> {this.state.p[3][0]} </button>
            <button className="stlpec stlpec2" style={{backgroundColor:this.state.c[3][1], color:this.state.d[3][1]}} onClick={e => this.boxClicked(e, 3, 1)}> {this.state.p[3][1]} </button>
            <button className="stlpec stlpec3" style={{backgroundColor:this.state.c[3][2], color:this.state.d[3][2]}} onClick={e => this.boxClicked(e, 3, 2)}> {this.state.p[3][2]} </button>
            <button /*onMouseOver={this.me} onMouseLeave={this.ml} */ className="stlpec stlpec4" style={{backgroundColor:this.state.c[3][3], color:this.state.d[3][3]}} onClick={e => this.boxClicked(e, 3, 3)}> {this.state.p[3][3]} </button>
            <button className="stlpec stlpec5" style={{backgroundColor:this.state.c[3][4], color:this.state.d[3][4]}} onClick={e => this.boxClicked(e, 3, 4)}> {this.state.p[3][4]} </button>

        </div> 
        <div className = "riadok riadok5">
            <button className="stlpec stlpec1" style={{backgroundColor:this.state.c[4][0], color:this.state.d[4][0]}} onClick={e => this.boxClicked(e, 4, 0)}> {this.state.p[4][0]} </button>
            <button className="stlpec stlpec2" style={{backgroundColor:this.state.c[4][1], color:this.state.d[4][1]}} onClick={e => this.boxClicked(e, 4, 1)}> {this.state.p[4][1]} </button>
            <button className="stlpec stlpec3" style={{backgroundColor:this.state.c[4][2], color:this.state.d[4][2]}} onClick={e => this.boxClicked(e, 4, 2)}> {this.state.p[4][2]} </button>
            <button className="stlpec stlpec4" style={{backgroundColor:this.state.c[4][3], color:this.state.d[4][3]}} onClick={e => this.boxClicked(e, 4, 3)}> {this.state.p[4][3]} </button>
            <button className="stlpec stlpec5" style={{backgroundColor:this.state.c[4][4], color:this.state.d[4][4]}} onClick={e => this.boxClicked(e, 4, 4)}> {this.state.p[4][4]} </button>

        </div> 
        
        <div className = "riadok">
        <div className = "difficulty">
          <span title="Difficulty">Difficulty:</span>
          
          <button className="difficultyButton vlcek" style={{backgroundColor:this.state.vlcek}} onClick={this.vlcek} > Vlcek </button>

        </div>
          <button className="difficultyButton" style={{backgroundColor:this.state.easy}} onClick={this.easy} > EASY </button>
          <button className="difficultyButton" style={{backgroundColor:this.state.medium}} onClick={this.medium} > MEDIUM </button>
          <button className="difficultyButton" style={{backgroundColor:this.state.hard}} onClick={this.hard} > HARD </button>
          <button className="difficultyButton imba" style={{backgroundColor:this.state.imba, color:this.state.imbaColor}} onClick={this.imba} > IMBA </button>
        </div>

        <div className = "riadok">
        <div style={{height:18, width:14*this.state.green}} className="stlpec green"></div>
        <div style={{height:18, width:350-14*this.state.green}} className="stlpec red"></div>
        
        </div>
        <a href = "">
        <div  className = "riadok reset">
            <div>RESET</div>
        </div>
        </a>

         <div  className = "riadok signature">
         <div className="counter">        {counter}
        </div>
        
         <div><a href="https://github.com/justdvl" target="blank">© 2018 David Vendel</a></div>
        </div>

        <div className = "riadok info">
        Firing {this.state.info} at once
        </div>
        

      </div>
    );
  }
}

export default App;
