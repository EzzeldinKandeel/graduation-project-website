import React, { useContext, useState, useEffect, useRef } from "react"
import { getCities, getProfessions } from "../data"
import "../styles/signup.css"
import { Link, Navigate, useNavigate } from "react-router-dom"
import api from "../api/axios"
import ErrorBackdrop from "../components/ErrorBackdrop"
import AuthContext from "../context/AuthProvider"

function SignUp() {
	let navigate = useNavigate()
	const { auth, setAuth } = useContext(AuthContext)

	const cities = getCities()
	const professions = getProfessions()
	const MOB_REGEX = /^01[0125][0-9]{8}$/
	const currentDate = new Date()
	const emailRef = useRef()
	const passwordRef = useRef()
	const passwordConfirmRef = useRef()
	const dateRef = useRef()
	const phoneRef = useRef()
	let years = (() => {
		let arr = []
		for (let i = 1900; i <= currentDate.getFullYear(); i++) arr.push(i)
		return arr
	})()
	let months = (() => {
		let arr = []
		for (let i = 1; i <= 12; i++) arr.push(i)
		return arr
	})()
	const generateDays = (month, year) => {
		let arr = []
		let lastDay = 30
		if (["0", "2", "4", "6", "7", "9", "11"].includes(month)) lastDay = 31
		else if (year % 4 === 0 && month === "1") lastDay = 29
		else if (month === "1") lastDay = 28
		for (let i = 1; i <= lastDay; i++) arr.push(i)
		return arr
	}
	const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/

	const [signUpData, setSignUpData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		passwordConfirm: "",
		gender: "",
		role: "",
		profession: "",
		phone: "",
		country: "مصر",
		city: "",
		line: "",
		day: currentDate.getDate(),
		month: currentDate.getMonth(),
		year: currentDate.getFullYear()
	})
	const [validSignUpData, setValidSignUpData] = useState({
		emailUnique: true,
		phone: true,
		phoneUnique: true,
		password: true,
		passwordConfirm: true,
		age: true
	})
	const [days, setDays] = useState([])
	const [error, setError] = useState(false)

	useEffect(() => {
		setDays(generateDays(signUpData.month, signUpData.year))
	}, [signUpData.month, signUpData.year])

	function checkAge() {
		let applicantBD = new Date(
			signUpData.year,
			signUpData.month,
			signUpData.day
		)
		let dayDate = currentDate.getTime()
		applicantBD = applicantBD.getTime()

		return dayDate - applicantBD >= 568024668000
	}

	function handleChange(event) {
		const { name, value } = event.target
		setSignUpData((prevSignUpData) => {
			return {
				...prevSignUpData,
				[name]: value
			}
		})
	}

	async function handleSubmit(event) {
		event.preventDefault()
		let validityChecks = {
			phone: MOB_REGEX.test(signUpData.phone),
			password: PWD_REGEX.test(signUpData.password),
			passwordConfirm: signUpData.password === signUpData.passwordConfirm,
			age: checkAge(),
			emailUnique: true,
			phoneUnique: true
		}
		setValidSignUpData(validityChecks)

		if (Object.values(validityChecks).some((value) => !value)) {
			if (!validityChecks.password) passwordRef.current.focus()
			else if (!validityChecks.passwordConfirm)
				passwordConfirmRef.current.focus()
			else if (!validityChecks.age) dateRef.current.focus()
			else if (!validityChecks.phone) phoneRef.current.focus()
			return
		}
		let finalSignUpData = { ...signUpData }

		if (finalSignUpData.role === "client") {
			delete finalSignUpData.profession
		}
		delete finalSignUpData.day
		delete finalSignUpData.month
		delete finalSignUpData.year
		delete finalSignUpData.passwordConfirm

		try {
			await api.post("/users", finalSignUpData)
			navigate("/sign-in")
		} catch (err) {
			let notUniqueErrorMsg = err.response.data.error.errors[0].message
			if (notUniqueErrorMsg === "email must be unique") {
				setValidSignUpData((prev) => ({ ...prev, emailUnique: false }))
				emailRef.current.focus()
			} else if (notUniqueErrorMsg === "phone must be unique") {
				setValidSignUpData((prev) => ({ ...prev, phoneUnique: false }))
				phoneRef.current.focus()
			} else {
				setError(true)
			}
		}
	}

	return auth ? (
		<Navigate to="/" replace={true} />
	) : (
		<div className="form">
			<ErrorBackdrop open={error} close={() => setError(false)} />
			<form onSubmit={handleSubmit}>
				<div className="input-container">
					<label>الاسم الأول</label>
					<input
						type="text"
						name="firstName"
						value={signUpData.firstName}
						onChange={handleChange}
						className="input-box"
						required
					/>
				</div>
				<div className="input-container">
					<label>الاسم الأخير</label>
					<input
						type="text"
						name="lastName"
						value={signUpData.lastName}
						onChange={handleChange}
						className="input-box"
						required
					/>
				</div>
				<div className="input-container">
					<label>البريد الإلكتروني</label>
					<input
						type="email"
						name="email"
						value={signUpData.email}
						onChange={handleChange}
						ref={emailRef}
						className="input-box"
						required
					/>
				</div>
				<p
					className="input-error"
					style={{ display: validSignUpData.emailUnique ? "none" : "" }}
				>
					لقد تم استخدام هذا البريد الإلكتروني من قبل.
				</p>
				<div className="input-container">
					<label>كلمة المرور</label>
					<input
						type="password"
						name="password"
						value={signUpData.password}
						onChange={handleChange}
						ref={passwordRef}
						className="input-box"
						required
					/>
				</div>
				<p
					className="input-error"
					style={{ display: validSignUpData.password ? "none" : "" }}
				>
					يجب أن تتكون كلمة المرور من 8 إلى 24 حرف، منهم على الأقل حرف علوى
					واحد، حرف سفلي واحد، رقم واحد، وعلامة من العلامات !@#$%.
				</p>
				<div className="input-container">
					<label>أعد إدخال كلمة المرور</label>
					<input
						type="password"
						name="passwordConfirm"
						value={signUpData.passwordConfirm}
						onChange={handleChange}
						ref={passwordConfirmRef}
						className="input-box"
						required
					/>
				</div>
				<p
					className="input-error"
					style={{
						display: validSignUpData.passwordConfirm ? "none" : ""
					}}
				>
					كلمة المرور غير مطابقة.
				</p>
				<div className="input-container">
					<label>تاريخ الميلاد</label>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							flexGrow: "1",
							gap: "1rem"
						}}
					>
						<select
							name="day"
							className="input-box"
							value={signUpData.day}
							onChange={handleChange}
							required
						>
							{days.map((day) => (
								<option key={day} value={day}>
									{day}
								</option>
							))}
						</select>
						<select
							name="month"
							className="input-box"
							value={signUpData.month}
							onChange={handleChange}
							required
						>
							{months.map((month) => (
								<option key={month} value={month - 1}>
									{month}
								</option>
							))}
						</select>
						<select
							name="year"
							className="input-box"
							value={signUpData.year}
							onChange={handleChange}
							ref={dateRef}
							required
						>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
				</div>
				<p
					className="input-error"
					style={{ display: validSignUpData.age ? "none" : "" }}
				>
					لا يسمح بالتسجيل لمن هم دون 18 عام.
				</p>
				<div className="input-container">
					<label>الجنس</label>
					<select
						name="gender"
						value={signUpData.gender}
						onChange={handleChange}
						className="input-box"
						required
					>
						<option disabled value="">
							-- إختر --
						</option>
						<option value="ذكر">ذكر</option>
						<option value="أنثى">أنثى</option>
					</select>
				</div>
				<div className="input-container">
					<label>المحافظة</label>
					<select
						name="city"
						value={signUpData.city}
						onChange={handleChange}
						className="input-box"
						required
					>
						<option disabled value="">
							-- إختر --
						</option>
						{cities.map((city) => (
							<option key={cities.indexOf(city)} value={city}>
								{city}
							</option>
						))}
					</select>
				</div>
				<div className="input-container">
					<label>رقم المحمول</label>
					<input
						type="tel"
						name="phone"
						value={signUpData.phone}
						onChange={handleChange}
						ref={phoneRef}
						className="input-box"
						required
					/>
				</div>
				<p
					className="input-error"
					style={{ display: validSignUpData.phone ? "none" : "" }}
				>
					برجاء إدخال رقم محمول صحيح (11 رقم).
				</p>
				<p
					className="input-error"
					style={{ display: validSignUpData.phoneUnique ? "none" : "" }}
				>
					لقد تم استخدام هذا الرقم من قبل.
				</p>
				<div className="input-container">
					<label>العنوان</label>
					<input
						type="text"
						name="line"
						value={signUpData.line}
						onChange={handleChange}
						className="input-box"
					/>
				</div>
				<div className="input-container">
					<label>نوع الحساب</label>
					<select
						name="role"
						value={signUpData.role}
						onChange={handleChange}
						className="input-box"
						required
					>
						<option disabled value="">
							-- إختر --
						</option>
						<option value="client">عميل</option>
						<option value="worker">حرفي</option>
					</select>
				</div>
				{signUpData.role === "worker" && (
					<div className="input-container">
						<label>الحرفة</label>
						<select
							name="profession"
							value={signUpData.profession}
							onChange={handleChange}
							className="input-box"
							required
						>
							<option disabled value="">
								-- إختر --
							</option>
							{professions.map((profession) => (
								<option
									key={professions.indexOf(profession)}
									value={profession}
								>
									{profession}
								</option>
							))}
						</select>
					</div>
				)}
				<div className="multiple-horizontal-buttons">
					<button type="submit" className="main-button">
						تسجيل
					</button>
					<button
						type="button"
						className="secondary-button"
						onClick={() => navigate("/")}
					>
						إلغاء
					</button>
				</div>
			</form>
			<p style={{ textAlign: "center" }}>
				لديك حساب بالفعل؟{" "}
				<Link to="/sign-in" style={{ color: "var(--clr-accent-400)" }}>
					تسجيل الدخول
				</Link>
			</p>
		</div>
	)
}

export default SignUp
