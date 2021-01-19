import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App"
import { AppBar, Button, Card, CardContent, CardHeader, CardMedia, Container, IconButton, OutlinedInput, Snackbar, Typography } from '@material-ui/core';
import { Delete, Email, Person } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import {useStyles} from './styles'
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom'

const url = "http://localhost:8080/"

ReactDOM.render(
	<Router>
        <AppBar style={{backgroundColor:"#136a8a",background:"linear-gradient(to right, #feac5e, #c779d0, #4bc0c8)"}}>
			<Button style={{color:"white"}}>Guest Book</Button>
		</AppBar>
        <Switch>
			<Route path="/dk" component={App} />
            <Route component={Index} />
        </Switch>
    </Router>, 
  document.getElementById('root')
);

function Index(props){
	const [firstName,setFirstName]=useState(""),[lastName,setLastName]=useState(""),[email,setEmail]=useState(""),
	[dob,setDOB]=useState(""),[phone,setPhone]=useState(""),[indicator,setIndicator]=useState({open:false,info:""}),
	[visitors,setVisitors]=useState([]),classes = useStyles(),[update,setUpdate]=useState(false),[id,setId]=useState("")
	
	useEffect(()=>{
		fetch(url).then(data=>data.json().then(res=>{
			setVisitors(res.data)
		}))
	},[props.location.value])

	function confirmDOB(){
		const date = new Date(),insertedDate = new Date(dob)
		if((date.getFullYear()-insertedDate.getFullYear())<13){
			setIndicator({open:true,info:"You are not of age. You must be 13 and above"})
			return false
		}else{
			return true
		}
	}
	function updateVisitor(visitor){
		setFirstName(visitor.firstname);setLastName(visitor.lastname);setEmail(visitor.email);setDOB(visitor.dob);setPhone(visitor.phone)
		setId(visitor._id)
		document.body.scrollTop = 0
		document.documentElement.scrollTop = 0;
		setUpdate(true)
	}
	async function deleteVisitor(visitor,index){
		await fetch(url+"delete",{method:"post",body:JSON.stringify({id:visitor._id})}).then(res=>res.json().then(res=>{
			if(res.data){
				setIndicator({open:true,info:`Record has been deleted`})
				setVisitors(res.data)
			}else{
				setIndicator({open:true,info:res.err})
			}
		})).catch(err=>{
			console.log(err)
			setIndicator({open:true,info:`An error occurred`})
		})
	}
	async function submit(e){
		const confirmEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		setIndicator({open:true,info:"Loading"})
		if(firstName.length>0&&lastName.length>0&&email.match(confirmEmail).length>0&&confirmDOB()&&phone.length===11){
			await fetch(`http://localhost:8080/${update?"update":"addrecord"}`,{credentials:"include",method:"post",body:new FormData(e.target)}).then(data=>data.json().then(res=>{
			if(res.data){
					update?setIndicator({open:true,info:`Your info has been updated`}):setIndicator({open:true,info:`Your info has been added. Welcome!`})
					setVisitors(res.data)
				}else{
					setIndicator({open:true,info:res.err})
				}
			})).catch((e)=>{
				console.log(e)
				setIndicator({open:true,info:"An error occurred"})
			})
		}else{
			if(confirmDOB()){
				setIndicator({open:true,info:"ERROR! Make sure all fields are completed correctly"})
			}
		}
	}
	return <Container style={{marginTop:"5%"}}>
		<Snackbar message={indicator.info} open={indicator.open}  onClose={()=>setIndicator({open:false})}  action={
            <React.Fragment>
                <IconButton aria-label="close" color="primary" onClick={()=>setIndicator({open:false})}>
                <CloseIcon />
                </IconButton>
            </React.Fragment>
        }/>
		{/*This is the visitors entry form  */}

		<Card>
			<CardContent>
				<form onSubmit={e=>{e.preventDefault();submit(e)}}>
					<input name="id" value={id} type="hidden" />
					<OutlinedInput style={{width:"100%",margin:"10px"}} name="firstname" endAdornment={<Person />} placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="first-name" required/>
					<OutlinedInput style={{width:"100%",margin:"10px"}} name="lastname" endAdornment={<Person />} placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="last-name" required/>
					<OutlinedInput style={{width:"100%",margin:"10px"}} name="email" type="email" endAdornment={<Email />} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/>
					<OutlinedInput style={{width:"100%",margin:"10px"}} name="dob" type="date" placeholder="Date of Birth" value={dob} onChange={e=>setDOB(e.target.value)} autoComplete="date-of-birth" required/>
					<OutlinedInput style={{width:"100%",margin:"10px"}} name="phone" type="phone" endAdornment={<Person />} placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="first name" required/>
					<input id="passport" name="passport" type="file" accept="image/*" style={{visibility:"hidden"}} required />
					<Button onClick={()=>document.getElementById("passport").click()} style={{width:"100%",margin:"10px"}} color="primary">Add Passport</Button>
					<Button variant="contained" color="primary" type="submit" style={{width:"100%",margin:"10px"}}>Submit</Button>
				</form>
			</CardContent>
		</Card>
		{/*This loops through the visitors and shows them as material } */}
		{visitors.map((visitor,index)=><Card  key={index}>
			<CardHeader action={<IconButton onClick={()=>deleteVisitor(visitor,index)}><Delete /></IconButton>} />
				<CardMedia onClick={()=>updateVisitor(visitor)} component='img' title={visitor.firstname} image={url+visitor.passport} className={classes.cardImage}  />
				<CardContent>
					<Typography style={{width:"100%"}}>Name: {visitor.lastname} {visitor.firstname}</Typography>
					<Typography style={{width:"100%"}}>Email: {visitor.email}</Typography>
					<Typography style={{width:"100%"}}>Date of Birth: {visitor.dob}</Typography>
					<Typography style={{width:"100%"}}>Phone Number: {visitor.phone}</Typography>
				</CardContent>
			</Card>
		)}
	</Container>
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
