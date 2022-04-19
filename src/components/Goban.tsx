import React, {useState, useRef} from "react"

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
	const [banmen_goishi_black, set_banmen_goishi_black] = useState<number[][]>([])
	const [banmen_goishi_white, set_banmen_goishi_white] = useState<number[][]>([])
	const goishi_block_black = useRef<number[][][]>([])
	const goishi_block_white = useRef<number[][][]>([])

	const current_goishi_block = useRef<number[][]>([])
	const current_goishi_vector = useRef<number[]>([])
	const current_goishi_vector_array = useRef<number[][]>([])

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

	const initializeGoban = () => {
		set_goban_state(initial_goban)
		set_current_phase("b")
		set_banmen_goishi_black([])
		set_banmen_goishi_white([])
		current_goishi_block.current = []
		goishi_block_black.current = []
		goishi_block_white.current = []
		console.log("---------------- game start ----------------\n\n")
	}

	const onClickMasu = (i: number, j: number) => {
		console.log(i, j)
		// goban
		let goban_state_copy: string[][] = goban_state.slice()
		if (goban_state_copy[i][j] != "") {
			return
		}
		goban_state_copy[i][j] = current_phase
		set_goban_state(goban_state_copy)

		// banmen ishi
		let banmen_goishi_black_copy = banmen_goishi_black.slice()
		let banmen_goishi_white_copy = banmen_goishi_white.slice()

		if (current_phase == "b") {
			// banmen ishi black
			banmen_goishi_black_copy.push([i, j])
			set_banmen_goishi_black(banmen_goishi_black_copy)
		}
		// calculate block
		calculate_goishi_block(banmen_goishi_black_copy, banmen_goishi_white_copy, current_phase)

		if (current_phase == "w") {
			// banmen ishi white
			banmen_goishi_white_copy.push([i, j])
			set_banmen_goishi_white(banmen_goishi_white_copy)
		}
		// calculate block
		calculate_goishi_block(banmen_goishi_black_copy, banmen_goishi_white_copy, current_phase)

		// calc atari
		calc_atari(banmen_goishi_black_copy, banmen_goishi_white_copy)

		// next move
		const next_move = current_phase == "b" ? "w" : "b"
		set_current_phase(next_move)
	}

	const calc_atari = (banmen_goishi_black_: number[][], banmen_goishi_white_: number[][]) => {
		goishi_block_black.current.forEach((b_block) => {
			console.log("----------- black -----------")
			calc_atari_surround(b_block, banmen_goishi_white_, banmen_goishi_black_)
		})
		goishi_block_white.current.forEach((w_block) => {
			console.log("----------- white -----------")
			calc_atari_surround(w_block, banmen_goishi_black_, banmen_goishi_white_)
		})
	}

	const calc_atari_surround = (block: number[][], banmen: number[][], banmen_opposite: number[][]) => {
		let atari_goishi: number[][] = []
		block.forEach((goishi) => {
			const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
			const right_ishi 	= goishi[1] + 1 < 9 ? [goishi[0], goishi[1] + 1] : []
			const top_ishi		= goishi[0] + 1 < 9 ? [goishi[0] + 1, goishi[1]] : []
			const bottom_ishi	= goishi[0] - 1 > -1 ? [goishi[0] - 1, goishi[1]] : []
			if (left_ishi != [] && !is_2dimension_array_include(block, left_ishi)) {
				atari_goishi.push(left_ishi)
			}
			if (right_ishi != [] && !is_2dimension_array_include(block, right_ishi)) {
				atari_goishi.push(right_ishi)
			}
			if (top_ishi != [] && !is_2dimension_array_include(block, top_ishi)) {
				atari_goishi.push(top_ishi)
			}
			if (bottom_ishi != [] && !is_2dimension_array_include(block, bottom_ishi)) {
				atari_goishi.push(bottom_ishi)
			}
		})
		atari_goishi = atari_goishi.filter((x, i, self) => self.indexOf(x) === i)
		atari_goishi = atari_goishi.filter((a_g) => {
			return a_g[0] != undefined
		})
		console.log("atari goishi ", block, atari_goishi)
		let atari_counter = 0
		// console.log("atari evaluation : ", block)
		for (const atari_g of atari_goishi) {
			if (!is_2dimension_array_include(banmen, atari_g)) {
				break
			}
			atari_counter += 1
			// console.log("atari contains ", atari_g)
		}
		if (atari_counter == atari_goishi.length) {
			//
			// console.log("atari gets")
			if (current_phase == "w") {
				let banmen_goishi_black_copy = banmen_opposite
				console.log(block, banmen_goishi_black_copy)
				block.forEach((b) => {
					if (is_2dimension_array_include(banmen_goishi_black_copy, b)) {
						banmen_goishi_black_copy = banmen_goishi_black_copy.filter((banmen_goishi_b) => {
							if (banmen_goishi_b[0] == b[0] && banmen_goishi_b[1] == b[1]) {
								return false
							}
							return true
						})
					}
				})
				set_banmen_goishi_black(banmen_goishi_black_copy)
				const goban_state_copy = goban_state
				block.forEach((b) => {
					goban_state_copy[b[0]][b[1]] = ""
				})
				set_goban_state(goban_state_copy)
			} else if (current_phase == "b") {
				let banmen_goishi_white_copy = banmen_opposite
				console.log(block, banmen_goishi_white_copy)
				block.forEach((b) => {
					if (is_2dimension_array_include(banmen_goishi_white_copy, b)) {
						banmen_goishi_white_copy = banmen_goishi_white_copy.filter((banmen_goishi_b) => {
							if (banmen_goishi_b[0] == b[0] && banmen_goishi_b[1] == b[1]) {
								return false
							}
							return true
						})
					}
				})
				set_banmen_goishi_white(banmen_goishi_white_copy)
				const goban_state_copy = goban_state
				block.forEach((b) => {
					goban_state_copy[b[0]][b[1]] = ""
				})
				set_goban_state(goban_state_copy)
			}
		}
	}

	const calculate_goishi_block = (banmen_goishi_black_copy: number[][], banmen_goishi_white_copy: number[][], current_phase: string) => {
		let banmen_goishi_result = []
		goishi_block_black.current = []
		goishi_block_white.current = []
		// if(current_phase == "b") {
			banmen_goishi_black_copy.forEach((ishi) => {
				current_goishi_block.current = []
				// check 
				const is_ishi_exist = is_2dimension_array_include(goishi_block_black.current.flat(), ishi)
				if (is_ishi_exist) {
					return
				}
				// add goishi to current goishi block
				const current_goishi_block_copy = current_goishi_block.current
				current_goishi_block_copy.push(ishi)
				current_goishi_block.current = current_goishi_block_copy
				// 
				each_calculate_goishi_block(ishi, banmen_goishi_black_copy, "")
				// 
				const goishi_block_black_copy = goishi_block_black.current.slice()
				goishi_block_black_copy.push(current_goishi_block.current)
				goishi_block_black.current = goishi_block_black_copy
			})
		// } else if (current_phase == "w") {
			banmen_goishi_white_copy.forEach((ishi) => {
				current_goishi_block.current = []
				const is_ishi_exist = is_2dimension_array_include(goishi_block_white.current.flat(), ishi)
				if (is_ishi_exist) {
					return
				}
				// add goishi to current goishi block
				const current_goishi_block_copy = current_goishi_block.current
				current_goishi_block_copy.push(ishi)
				current_goishi_block.current = current_goishi_block_copy
				//
				each_calculate_goishi_block(ishi, banmen_goishi_white_copy, "")
				//
				const goishi_block_white_copy = goishi_block_white.current.slice()
				goishi_block_white_copy.push(current_goishi_block.current)
				goishi_block_white.current = goishi_block_white_copy
			})
		// }
	}

	const each_calculate_goishi_block = (goishi: number[], banmen_goishi: number[][], houkou: string) => {
		const filtered_current_goishi_block = current_goishi_block.current.filter((c) => {
			if (c[0] == goishi[0] && c[1] == goishi[1]) {
				return false
			}
			return true
		})
		if (is_2dimension_array_include(filtered_current_goishi_block, goishi)) {
			console.log("Goishi stops @", goishi)
			return
		}
		if (houkou == "") {
			current_goishi_vector.current = [0, 0]
			current_goishi_vector_array.current = [[0, 0]]
		}

		const left_ishi		= [goishi[0], goishi[1] - 1]
		const right_ishi 	= [goishi[0], goishi[1] + 1]
		const top_ishi		= [goishi[0] + 1, goishi[1]]
		const bottom_ishi	= [goishi[0] - 1, goishi[1]]
		const left_ishi_str		= goishi[0].toString() + (goishi[1] - 1).toString()
		const right_ishi_str 	= goishi[0].toString() + (goishi[1] + 1).toString()
		const top_ishi_str		= (goishi[0] + 1).toString() + goishi[1].toString()
		const bottom_ishi_str	= (goishi[0] - 1).toString() + goishi[1].toString()
		const banmen_goishi_flat: string[] = banmen_goishi.map((b) => b[0].toString() + b[1].toString())

		if (houkou != "right" && banmen_goishi_flat.includes(left_ishi_str)) {
			const current_goishi_block_copy = current_goishi_block.current.slice()
			// 
			current_goishi_vector.current = [current_goishi_vector.current[0], current_goishi_vector.current[1] - 1]
			if (is_2dimension_array_include(current_goishi_vector_array.current, current_goishi_vector.current)) {
				// console.log("same vector found right", current_goishi_vector_array.current, current_goishi_vector.current)
				return
			}
			const current_goishi_vector_array_copy = current_goishi_vector_array.current.slice()
			current_goishi_vector_array_copy.push(current_goishi_vector.current)
			current_goishi_vector_array.current = current_goishi_vector_array_copy
			// 
			// console.log("left find", left_ishi)
			current_goishi_block_copy.push(left_ishi)
			current_goishi_block.current = current_goishi_block_copy
			each_calculate_goishi_block(left_ishi, banmen_goishi, "left")
		}
		if (houkou != "left" && banmen_goishi_flat.includes(right_ishi_str)) {
			const current_goishi_block_copy = current_goishi_block.current.slice()
			// 
			current_goishi_vector.current = [current_goishi_vector.current[0], current_goishi_vector.current[1] + 1]
			if (is_2dimension_array_include(current_goishi_vector_array.current, current_goishi_vector.current)) {
				// console.log("same vector found left", current_goishi_vector_array.current, current_goishi_vector.current)
				return
			}
			const current_goishi_vector_array_copy = current_goishi_vector_array.current.slice()
			current_goishi_vector_array_copy.push(current_goishi_vector.current)
			current_goishi_vector_array.current = current_goishi_vector_array_copy
			// 
			// console.log("right find", right_ishi)
			current_goishi_block_copy.push(right_ishi)
			current_goishi_block.current = current_goishi_block_copy
			each_calculate_goishi_block(right_ishi, banmen_goishi, "right")
		}
		if (houkou != "bottom" && banmen_goishi_flat.includes(top_ishi_str)) {
			const current_goishi_block_copy = current_goishi_block.current.slice()
			// 
			current_goishi_vector.current = [current_goishi_vector.current[0] - 1, current_goishi_vector.current[1]]
			if (is_2dimension_array_include(current_goishi_vector_array.current, current_goishi_vector.current)) {
				// console.log("same vector found bottom", current_goishi_vector_array.current, current_goishi_vector.current)
				return
			}
			const current_goishi_vector_array_copy = current_goishi_vector_array.current.slice()
			current_goishi_vector_array_copy.push(current_goishi_vector.current)
			current_goishi_vector_array.current = current_goishi_vector_array_copy
			// 
			// console.log("top find", top_ishi)
			current_goishi_block_copy.push(top_ishi)
			current_goishi_block.current = current_goishi_block_copy
			each_calculate_goishi_block(top_ishi, banmen_goishi, "top")
		}
		if (houkou != "top" && banmen_goishi_flat.includes(bottom_ishi_str)) {
			const current_goishi_block_copy = current_goishi_block.current.slice()
			// 
			current_goishi_vector.current = [current_goishi_vector.current[0] + 1, current_goishi_vector.current[1]]
			if (is_2dimension_array_include(current_goishi_vector_array.current, current_goishi_vector.current)) {
				// console.log("same vector found top", current_goishi_vector_array.current, current_goishi_vector.current)
				return
			}
			const current_goishi_vector_array_copy = current_goishi_vector_array.current.slice()
			current_goishi_vector_array_copy.push(current_goishi_vector.current)
			current_goishi_vector_array.current = current_goishi_vector_array_copy
			//
			// console.log("bottom find", bottom_ishi)
			current_goishi_block_copy.push(bottom_ishi)
			current_goishi_block.current = current_goishi_block_copy
			each_calculate_goishi_block(bottom_ishi, banmen_goishi, "bottom")
			console.log("current ishi", current_goishi_block_copy)
		}
	}

	const is_2dimension_array_include = (array: number[][], item: number[]) => {
		const mapped_array = array.map((a) => a[0].toString() + a[1].toString())
		if (!item[0] && !item[1]) { return false }
		const mapped_item = item[0].toString() + item[1].toString()
		return mapped_array.includes(mapped_item) 
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
			<button onClick={() => initializeGoban()}>
				初期化する
			</button>
		</div>
	)
}

export default Goban