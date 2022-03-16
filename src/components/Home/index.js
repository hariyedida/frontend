import "./index.css";
import React, { Component } from "react";
import ReactFileReader from "react-file-reader";
import Header from "../Header";
import UserData from "../UserData";
import Loader from "react-loader-spinner";
import Cookies from "js-cookie";

const apiStatusConstants = {
	initial: "INITIAL",
	success: "SUCCESS",
	failure: "FAILURE",
	inProgress: "IN_PROGRESS",
};

class Home extends Component {
	state = {
		inputFileData: [],
		fetchedData: [],
		apiStatus: apiStatusConstants.initial,
	};

	componentDidMount = () => {
		this.getDataFromDb();
	};

	postDataToDb = async () => {
		const { inputFileData } = this.state;
		this.setState({
			apiStatus: apiStatusConstants.inProgress,
		});
		const jwtToken = Cookies.get("jwt_token");
		const apiUrl = `https://react-user-login-test.herokuapp.com/user-table/`;
		const options = {
			headers: {
				Authorization: `Bearer ${jwtToken}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(inputFileData),
		};
		const response = await fetch(apiUrl, options);
	};

	getDataFromDb = async () => {
		const jwtToken = Cookies.get("jwt_token");
		const apiUrl = `https://react-user-login-test.herokuapp.com/user-data/`;
		const options = {
			headers: {
				Authorization: `Bearer ${jwtToken}`,
				"Content-Type": "application/json",
			},
			method: "GET",
		};
		const response = await fetch(apiUrl, options);
		if (response.ok) {
			const fetchedData = await response.json();
			const updateData = fetchedData.userData.map((eachData) => ({
				id: eachData.id,
				userId: eachData.user_id,
				body: eachData.body,
				title: eachData.title,
			}));
			this.setState({
				apiStatus: apiStatusConstants.success,
				fetchedData: [...updateData],
			});
		} else {
			this.setState({ apiStatus: apiStatusConstants.failure });
		}
	};

	renderDataFromDb = () => {
		const { fetchedData } = this.state;
		return (
			<ul className='ul-list'>
				{fetchedData.map((eachData) => (
					<UserData userData={eachData} key={eachData.id} />
				))}
			</ul>
		);
	};

	handleFiles = (files) => {
		const reader = new FileReader();
		reader.readAsText(files[0]);
		reader.onload = function (e) {
			localStorage.setItem("jsonData", e.target.result);
		};
		this.setState(
			{
				inputFileData: JSON.parse(localStorage.getItem("jsonData")),
			},
			this.postDataToDb
		);
	};

	renderFailureView = () => (
		<div className='all-rest-failure-container'>
			<img
				src='https://res.cloudinary.com/hariy/image/upload/v1642997774/TastyKitchen/cooking_1_lpi3li.png'
				alt='not-found'
			/>
		</div>
	);

	renderLoadingView = () => (
		<div style={{ width: "100%", height: "280px" }}>
			<Loader type='Oval' color='#f7931e' height='50' width='50' />
		</div>
	);

	renderUserInput = () => {
		const { apiStatus } = this.state;
		switch (apiStatus) {
			case apiStatusConstants.success:
				return this.renderDataFromDb();
			case apiStatusConstants.failure:
				return this.renderFailureView();
			case apiStatusConstants.inProgress:
				return this.renderLoadingView();
			default:
				return null;
		}
	};

	render() {
		return (
			<div className='home-container'>
				<Header />
				<h1>home</h1>
				<ReactFileReader
					fileTypes={[".json"]}
					handleFiles={this.handleFiles}
				>
					<button className='btn'>Upload</button>
				</ReactFileReader>
				<div className='data-container'>{this.renderUserInput()}</div>
			</div>
		);
	}
}

export default Home;
