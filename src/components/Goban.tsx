import React, {useState} from "react"

import "../css/goban.css"
import black_stone from "../public/goishi_black.png"
import white_stone from "../public/goishi_white.png"

const Goban = () => {

	const initial_goban = Array(9).fill("")
	initial_goban.forEach((_, i) => {
		initial_goban[i] = Array(9).fill("")
	})

	const [goban_state, set_goban_state] = useState<string[][]>(initial_goban)
	const [current_phase, set_current_phase] = useState<string>("b")
	const [goishi_block, set_goishi_block] = useState<number[][][]>([])

	const calculate_goban_css = (i: number, j: number) => {
		const className = ""
		if ( i == 0 && j == 0) {
			return "goban-masu goban-left-top"
		} else if ( i == 0 && j == 8 ) {
			return "goban-masu goban-right-top"
		} else if ( i == 8 && j == 0 ) {
			return "goban-masu goban-left-bottom"
		} else if ( i == 8 && j == 8 ) {
			return "goban-masu goban-right-bottom"
		} else if ( i == 0 ) {
			return "goban-masu goban-top-line"
		} else if ( i == 8 ) {
			return "goban-masu goban-bottom-line"
		} else if ( j == 0 ) {
			return "goban-masu goban-left-line"
		} else if ( j == 8 ) {
			return "goban-masu goban-right-line"
		}
		return "goban-masu goban-center"
	}

	const onClickMasu = (i: number, j: number) => {
		console.log(i, j)
		const goban_state_copy: string[][] = goban_state.slice()
		goban_state_copy[i][j] = current_phase
		set_goban_state(goban_state_copy)
		const next_move = current_phase == "b" ? "w" : "b"
		set_current_phase(next_move)
	}

	const calculate_goishi_block = () => {
		
	}

	return(
		<div className="goban">
			{goban_state.map((goban_line, i_index) => (
				goban_line.map((goban_masu, j_index) => {
					const className = calculate_goban_css(i_index, j_index)
					return(
						<>
							<div
								className={className}
								onClick={() => onClickMasu(i_index, j_index)}
							>
								{ goban_state[i_index][j_index] == "" &&
									<div className="background-none">
										{"　"}
									</div>
								}
								{ goban_state[i_index][j_index] == "b" &&
									<div className="background-black-stone">
										{"　"}
									</div>
								}
								{ goban_state[i_index][j_index] == "w" &&
									<div className="background-white-stone">
										{"　"}
									</div>
								}
							</div>
							{j_index == 8 && <br/>}
						</>
					)
				})
			))}
		</div>
	)
}

export default Goban