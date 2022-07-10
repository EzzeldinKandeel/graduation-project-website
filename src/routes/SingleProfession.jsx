import React, { useContext, useEffect, useState } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import LargeWorkerCard from "../components/LargeWorkerCard"
import "../styles/SingleProfession.css"
import api from "../api/axios"
import AuthContext from "../context/AuthProvider"

function SingleProfession() {
	const { auth } = useContext(AuthContext)
	const { city } = useOutletContext()
	let params = useParams()
	let profession = params.profession

	const [workers, setWorkers] = useState([])
	const [noWorkers, setNoWorkers] = useState(false)
	useEffect(async () => {
		try {
			const response = await api.get("/workers", {
				params: { city: city, profession: profession }
			})
			setWorkers(response.data.data.workers)
			if (response.data.data.count === 0) setNoWorkers(true)
			else setNoWorkers(false)
		} catch (err) {
			console.error(err.message)
		}
	}, [city])

	return noWorkers ? (
		<h1 className="content-does-not-exist">لا يوجد حرفيين.</h1>
	) : (
		<div className="workers">
			{workers.map((worker) => (
				<LargeWorkerCard
					key={worker.id}
					worker={worker}
					showProfession={false}
				/>
			))}
		</div>
	)
}

export default SingleProfession
