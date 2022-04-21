import React, {useState, useRef} from "react"

import "../css/goban.css"
import black_stone from "../public/goishi_black.png"
import white_stone from "../public/goishi_white.png"

const Goban = () => {

	const GOMAN_WIDTH = 19

	const initial_goban = Array(GOMAN_WIDTH).fill("")
	initial_goban.forEach((_, i) => {
		initial_goban[i] = Array(GOMAN_WIDTH).fill("")
	})

	const [goban_state, set_goban_state] = useState<string[][]>(initial_goban)
	const current_phase = useRef<string>("b")
	// const [banmen_goishi_black, set_banmen_goishi_black] = useState<number[][]>([])
	// const [banmen_goishi_white, set_banmen_goishi_white] = useState<number[][]>([])
	const banmen_goishi_black = useRef<number[][]>([])
	const banmen_goishi_white = useRef<number[][]>([])
	const goishi_block_black = useRef<number[][][]>([])
	const goishi_block_white = useRef<number[][][]>([])

	const current_goishi_block = useRef<number[][]>([])
	const current_goishi_vector = useRef<number[]>([])
	const current_goishi_vector_array = useRef<number[][]>([])

	const [ko, setKo] = useState<number[]>([-1, -1])

	const [agehama_black, set_agehama_black] = useState<number>(0)
	const [agehama_white, set_agehama_white] = useState<number>(0)

	const taikyoku_tezyun = useRef<number>(0)
	const tezyun = useRef<number[][]>([])
	const tezyun_interval = useRef<any>()

	const calculate_goban_css = (i: number, j: number) => {
		const className = ""
		if ( i == 0 && j == 0) {
			return "goban-masu goban-left-top"
		} else if ( i == 0 && j == (GOMAN_WIDTH -1) ) {
			return "goban-masu goban-right-top"
		} else if ( i == (GOMAN_WIDTH -1) && j == 0 ) {
			return "goban-masu goban-left-bottom"
		} else if ( i == (GOMAN_WIDTH -1) && j == (GOMAN_WIDTH -1) ) {
			return "goban-masu goban-right-bottom"
		} else if ( i == 0 ) {
			return "goban-masu goban-top-line"
		} else if ( i == (GOMAN_WIDTH -1) ) {
			return "goban-masu goban-bottom-line"
		} else if ( j == 0 ) {
			return "goban-masu goban-left-line"
		} else if ( j == (GOMAN_WIDTH -1) ) {
			return "goban-masu goban-right-line"
		}
		return "goban-masu goban-center"
	}

	const initializeGoban = () => {
		set_goban_state(initial_goban)
		current_phase.current = "b"
		banmen_goishi_black.current = []
		banmen_goishi_white.current = []
		current_goishi_block.current = []
		goishi_block_black.current = []
		goishi_block_white.current = []
		set_agehama_black(0)
		set_agehama_white(0)
		console.log("---------------- game start ----------------\n\n")
	}

	const onClickMasu = (i: number, j: number) => {
		console.log(i, j, current_phase.current)
		// ko
		if (ko[0] == i && ko[1] == j) {
			return
		}
		// goban
		let goban_state_copy: string[][] = goban_state.slice()
		if (goban_state_copy[i][j] != "") {
			return
		}
		goban_state_copy[i][j] = current_phase.current
		set_goban_state(goban_state_copy)

		// banmen ishi
		let banmen_goishi_black_copy = banmen_goishi_black.current.slice()
		let banmen_goishi_white_copy = banmen_goishi_white.current.slice()

		if (current_phase.current == "b") {
			// banmen ishi black
			banmen_goishi_black_copy.push([i, j])
			banmen_goishi_black.current = banmen_goishi_black_copy
		}
		// calculate block
		calculate_goishi_block(banmen_goishi_black_copy, banmen_goishi_white_copy)

		if (current_phase.current == "w") {
			// banmen ishi white
			banmen_goishi_white_copy.push([i, j])
			banmen_goishi_white.current = banmen_goishi_white_copy
		}
		// calculate block
		calculate_goishi_block(banmen_goishi_black_copy, banmen_goishi_white_copy)
		// suicide
		const zisatu_result = check_zisatu([i, j], banmen_goishi_black_copy, banmen_goishi_white_copy)
		if (zisatu_result == false) {
			return
		}

		// calc atari
		calc_atari(banmen_goishi_black_copy, banmen_goishi_white_copy, [i, j])

		// next move
		const next_move = current_phase.current == "b" ? "w" : "b"
		current_phase.current = next_move
		// next move ko
		if (ko[0] != -1 || ko[1] != -1) {
			setKo(ko => [-1, -1])
		}
	}

	const check_zisatu = (current_move: number[], banmen_goishi_black_: number[][], banmen_goishi_white_: number[][]) => {
		if (current_phase.current == "b") {
			const goishi_block_black_copy = goishi_block_black.current
			let current_goishi_block: number[][] = [];
			goishi_block_black_copy.forEach((goban_black_b) => {
				if ( is_2dimension_array_include(goban_black_b, current_move) ) {
					current_goishi_block = goban_black_b
				}
			})
			let current_goishi_surrounding: number[][] = []
			current_goishi_block.forEach((goishi: number[]) => {
				const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
				const right_ishi 	= goishi[1] + 1 < GOMAN_WIDTH  ? [goishi[0], goishi[1] + 1] : []
				const top_ishi		= goishi[0] + 1 < GOMAN_WIDTH  ? [goishi[0] + 1, goishi[1]] : []
				const bottom_ishi	= goishi[0] - 1 > -1 ? [goishi[0] - 1, goishi[1]] : []
				current_goishi_surrounding.push(left_ishi, right_ishi, top_ishi, bottom_ishi)
			})
			current_goishi_surrounding = current_goishi_surrounding.filter((x, i, self) => self.indexOf(x) === i)
			current_goishi_surrounding = current_goishi_surrounding.filter((s_g) => {
				if (is_2dimension_array_include(current_goishi_block, s_g)) {
					return false
				}
				return true
			})
			current_goishi_surrounding = current_goishi_surrounding.filter((s_g) => {
				return s_g[0] != undefined
			})
			console.log("surrounding goishi", current_goishi_block, current_goishi_surrounding)
			let surrounding_flag = 0
			for (const c_s_goishi of current_goishi_surrounding){
				if (!is_2dimension_array_include(banmen_goishi_white_, c_s_goishi)) {
					break
				}
				surrounding_flag += 1
			}
			if (surrounding_flag == current_goishi_surrounding.length) {
				
				const goishi_block_white_copy = goishi_block_white.current
				let current_goishi_blocks: number[][][] = []
				for(const c_s_goishi of current_goishi_surrounding){
					for (const b_b_goishi of goishi_block_white_copy) {
						if (is_2dimension_array_include(b_b_goishi, c_s_goishi)) {
							current_goishi_blocks.push(b_b_goishi)
						}
					}
				}
				console.log(current_goishi_blocks)
				for(const c_b_goishi of current_goishi_blocks) {
					let current_goishi_result: number[][] = []
					for(const goishi of c_b_goishi) {
						const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
						const right_ishi 	= goishi[1] + 1 < GOMAN_WIDTH  ? [goishi[0], goishi[1] + 1] : []
						const top_ishi		= goishi[0] + 1 < GOMAN_WIDTH  ? [goishi[0] + 1, goishi[1]] : []
						const bottom_ishi	= goishi[0] - 1 > -1 ? [goishi[0] - 1, goishi[1]] : []
						current_goishi_result.push(left_ishi, right_ishi, top_ishi, bottom_ishi)
					}
					current_goishi_result = current_goishi_result.filter((x, i, self) => self.indexOf(x) === i)
					current_goishi_result = current_goishi_result.filter((s_g) => {
						return s_g[0] != undefined
					})
					current_goishi_result = current_goishi_result.filter((c_g_r) => {
						if (is_2dimension_array_include(c_b_goishi, c_g_r)) {
							return false
						}
						return true
					})
					console.log("current goishi results ", current_goishi_result)
					const current_goishi_check = current_goishi_result.every((c_goishi_result) => {
						return is_2dimension_array_include(banmen_goishi_black_, c_goishi_result)
					})
					console.log("current goishi check", current_goishi_check, current_goishi_result, banmen_goishi_black.current)
					if (current_goishi_check == true) {
						console.log("----------- goishi check clear -----------")
						return true
					}
				}

				// 着手を取り消し goishi_black
				let banmen_goishi_black_copy: number[][] = banmen_goishi_black_.slice()
				banmen_goishi_black_copy = banmen_goishi_black_copy.filter((b_g_black) => {
					if ( b_g_black[0] == current_move[0] && b_g_black[1] == current_move[1] ) {
						return false
					}
					return true
				})
				banmen_goishi_black.current = banmen_goishi_black_copy
				// 着手を取り消し state
				let goban_state_copy: string[][] = goban_state.slice()
				goban_state_copy[current_move[0]][current_move[1]] = ""
				set_goban_state(goban_state_copy)
				return false
			}
		} else if (current_phase.current == "w") {
			const goishi_block_white_copy = goishi_block_white.current
			let current_goishi_block: number[][] = [];
			goishi_block_white_copy.forEach((goban_white_b) => {
				if ( is_2dimension_array_include(goban_white_b, current_move) ) {
					current_goishi_block = goban_white_b
				}
			})
			let current_goishi_surrounding: number[][] = []
			current_goishi_block.forEach((goishi: number[]) => {
				const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
				const right_ishi 	= goishi[1] + 1 < GOMAN_WIDTH  ? [goishi[0], goishi[1] + 1] : []
				const top_ishi		= goishi[0] + 1 < GOMAN_WIDTH  ? [goishi[0] + 1, goishi[1]] : []
				const bottom_ishi	= goishi[0] - 1 > -1 ? [goishi[0] - 1, goishi[1]] : []
				current_goishi_surrounding.push(left_ishi, right_ishi, top_ishi, bottom_ishi)
			})
			current_goishi_surrounding = current_goishi_surrounding.filter((x, i, self) => self.indexOf(x) === i)
			current_goishi_surrounding = current_goishi_surrounding.filter((s_g) => {
				if (is_2dimension_array_include(current_goishi_block, s_g)) {
					return false
				}
				return true
			})
			current_goishi_surrounding = current_goishi_surrounding.filter((s_g) => {
				return s_g[0] != undefined
			})
			console.log("surrounding goishi", current_goishi_block, current_goishi_surrounding)
			let surrounding_flag = 0
			for (const c_s_goishi of current_goishi_surrounding){
				if (!is_2dimension_array_include(banmen_goishi_black_, c_s_goishi)) {
					break
				}
				surrounding_flag += 1
			}
			if (surrounding_flag == current_goishi_surrounding.length) {
				const goishi_block_black_copy = goishi_block_black.current
				let current_goishi_blocks: number[][][] = []
				for(const c_s_goishi of current_goishi_surrounding){
					for (const b_b_goishi of goishi_block_black_copy) {
						if (is_2dimension_array_include(b_b_goishi, c_s_goishi)) {
							current_goishi_blocks.push(b_b_goishi)
						}
					}
				}
				console.log(current_goishi_blocks)
				for(const c_b_goishi of current_goishi_blocks) {
					let current_goishi_result: number[][] = []
					for(const goishi of c_b_goishi) {
						const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
						const right_ishi 	= goishi[1] + 1 < GOMAN_WIDTH  ? [goishi[0], goishi[1] + 1] : []
						const top_ishi		= goishi[0] + 1 < GOMAN_WIDTH  ? [goishi[0] + 1, goishi[1]] : []
						const bottom_ishi	= goishi[0] - 1 > -1 ? [goishi[0] - 1, goishi[1]] : []
						current_goishi_result.push(left_ishi, right_ishi, top_ishi, bottom_ishi)
					}
					current_goishi_result = current_goishi_result.filter((x, i, self) => self.indexOf(x) === i)
					current_goishi_result = current_goishi_result.filter((s_g) => {
						return s_g[0] != undefined
					})
					current_goishi_result = current_goishi_result.filter((c_g_r) => {
						if (is_2dimension_array_include(c_b_goishi, c_g_r)) {
							return false
						}
						return true
					})
					console.log("current goishi results ", current_goishi_result)
					const current_goishi_check = current_goishi_result.every((c_goishi_result) => {
						return is_2dimension_array_include(banmen_goishi_white_, c_goishi_result)
					})
					if (current_goishi_check == true) {
						console.log("----------- goishi check clear -----------")
						return true
					}
				}

				// 着手を取り消し goishi_black
				let banmen_goishi_white_copy: number[][] = banmen_goishi_white_.slice()
				banmen_goishi_white_copy = banmen_goishi_white_copy.filter((b_g_white) => {
					if ( b_g_white[0] == current_move[0] && b_g_white[1] == current_move[1] ) {
						return false
					}
					return true
				})
				banmen_goishi_black.current = banmen_goishi_white_copy
				// 着手を取り消し state
				let goban_state_copy: string[][] = goban_state.slice()
				goban_state_copy[current_move[0]][current_move[1]] = ""
				set_goban_state(goban_state_copy)
				return false
			}
		}
	}

	const calc_atari = (banmen_goishi_black_: number[][], banmen_goishi_white_: number[][], current_move: number[]) => {
		goishi_block_black.current.forEach((b_block) => {
			// console.log("----------- black -----------")
			calc_atari_surround(b_block, banmen_goishi_white_, banmen_goishi_black_, current_move)
		})
		goishi_block_white.current.forEach((w_block) => {
			// console.log("----------- white -----------")
			calc_atari_surround(w_block, banmen_goishi_black_, banmen_goishi_white_, current_move)
		})
	}

	const calc_atari_surround = (block: number[][], banmen: number[][], banmen_opposite: number[][], current_move: number[]) => {
		let atari_goishi: number[][] = []
		block.forEach((goishi) => {
			const left_ishi		= goishi[1] - 1 > -1 ? [goishi[0], goishi[1] - 1] : []
			const right_ishi 	= goishi[1] + 1 < GOMAN_WIDTH ? [goishi[0], goishi[1] + 1] : []
			const top_ishi		= goishi[0] + 1 < GOMAN_WIDTH ? [goishi[0] + 1, goishi[1]] : []
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
		// atari_goishi = atari_goishi.filter((a_g) => {
		// 	if ( is_2dimension_array_include(a_g, banmen_opposite) ) {
		// 		return false
		// 	}
		// 	return true
		// })
		// console.log("atari goishi ", block, atari_goishi)
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
			if (current_phase.current == "w") {
				if (is_2dimension_array_include(block, current_move)) {
					judge_ko(current_move, banmen, banmen_opposite)
					return
				}
				let banmen_goishi_black_copy = banmen_opposite
				// console.log("agehama get ", block.length)
				set_agehama_black((agehama_black) => agehama_black + block.length)
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
				banmen_goishi_black.current = banmen_goishi_black_copy
				const goban_state_copy = goban_state
				block.forEach((b) => {
					goban_state_copy[b[0]][b[1]] = ""
				})
				set_goban_state(goban_state_copy)
			} else if (current_phase.current == "b") {
				if (is_2dimension_array_include(block, current_move)) {
					judge_ko(current_move, banmen, banmen_opposite)
					return
				}
				let banmen_goishi_white_copy = banmen_opposite
				set_agehama_white((agehama_white) => agehama_white + block.length)
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
				banmen_goishi_white.current = banmen_goishi_white_copy
				const goban_state_copy = goban_state
				block.forEach((b) => {
					goban_state_copy[b[0]][b[1]] = ""
				})
				set_goban_state(goban_state_copy)
			}
		}
	}

	// impl ko
	const judge_ko = (current_move: number[], banmen: number[][], banmen_opposite: number[][]) => {
		if ( current_phase.current == "w" ) {
			const left_ishi		= current_move[1] - 1 > -1 ? [current_move[0], current_move[1] - 1] : []
			const right_ishi 	= current_move[1] + 1 < GOMAN_WIDTH  ? [current_move[0], current_move[1] + 1] : []
			const top_ishi		= current_move[0] + 1 < GOMAN_WIDTH  ? [current_move[0] + 1, current_move[1]] : []
			const bottom_ishi	= current_move[0] - 1 > -1 ? [current_move[0] - 1, current_move[1]] : []
			let surrounding_ishi = [left_ishi, right_ishi, top_ishi, bottom_ishi]
			surrounding_ishi = surrounding_ishi.filter((s_ishi) => s_ishi != [])
			let goishi_block_black_copy = goishi_block_black.current
			goishi_block_black_copy = goishi_block_black_copy.filter((goishi_b) => {
				if (goishi_b.length == 1) {
					return true
				}
				return false
			})
			let left_ishi_result, right_ishi_result, top_ishi_result, bottom_ishi_result;
			let ishi_result: (number[] | undefined)[] = []
			goishi_block_black_copy.forEach(goishi_b => {
				const is_left_exist  = is_2dimension_array_include(goishi_b, left_ishi)
				const is_right_exist = is_2dimension_array_include(goishi_b, right_ishi)
				const is_top_exist   = is_2dimension_array_include(goishi_b, top_ishi)
				const is_bottom_exist = is_2dimension_array_include(goishi_b, bottom_ishi)
				if (is_left_exist) { left_ishi_result = left_ishi }
				if (is_right_exist) { right_ishi_result = right_ishi }
				if (is_top_exist) { top_ishi_result = top_ishi }
				if (is_bottom_exist) { bottom_ishi_result = bottom_ishi }
			})
			ishi_result.push(left_ishi_result)
			ishi_result.push(right_ishi_result)
			ishi_result.push(top_ishi_result)
			ishi_result.push(bottom_ishi_result)
			ishi_result = ishi_result.filter((ishi) => {
				if (ishi == undefined) { return false }
				return true
			})
			ishi_result.forEach((ishi) => {
				const left_ishi		= ishi![1] - 1 > -1 ? [ishi![0], ishi![1] - 1] : []
				const right_ishi 	= ishi![1] + 1 < GOMAN_WIDTH ? [ishi![0], ishi![1] + 1] : []
				const top_ishi		= ishi![0] + 1 < GOMAN_WIDTH ? [ishi![0] + 1, ishi![1]] : []
				const bottom_ishi	= ishi![0] - 1 > -1 ? [ishi![0] - 1, ishi![1]] : []
				//
				const left_ishi_exist = is_2dimension_array_include(banmen_opposite, left_ishi)
				const right_ishi_exist = is_2dimension_array_include(banmen_opposite, right_ishi)
				const top_ishi_exist = is_2dimension_array_include(banmen_opposite, top_ishi)
				const bottom_ishi_exist = is_2dimension_array_include(banmen_opposite, bottom_ishi)
				console.log("ko result", left_ishi, right_ishi, top_ishi, bottom_ishi)
				if ( left_ishi_exist && right_ishi_exist && top_ishi_exist && bottom_ishi_exist ) {
					setKo([ishi![0], ishi![1]])
				}
			})
			// console.log("goishi black", goishi_block_black_copy)
			console.log("goishi block black", ishi_result)
		} else if (current_phase.current == "b") {
			const left_ishi		= current_move[1] - 1 > -1 ? [current_move[0], current_move[1] - 1] : []
			const right_ishi 	= current_move[1] + 1 < GOMAN_WIDTH ? [current_move[0], current_move[1] + 1] : []
			const top_ishi		= current_move[0] + 1 < GOMAN_WIDTH ? [current_move[0] + 1, current_move[1]] : []
			const bottom_ishi	= current_move[0] - 1 > -1 ? [current_move[0] - 1, current_move[1]] : []
			let surrounding_ishi = [left_ishi, right_ishi, top_ishi, bottom_ishi]
			surrounding_ishi = surrounding_ishi.filter((s_ishi) => s_ishi != [])
			let goishi_block_white_copy = goishi_block_white.current
			goishi_block_white_copy = goishi_block_white_copy.filter((goishi_b) => {
				if (goishi_b.length == 1) {
					return true
				}
				return false
			})
			let left_ishi_result, right_ishi_result, top_ishi_result, bottom_ishi_result;
			let ishi_result: (number[] | undefined)[] = []
			goishi_block_white_copy.forEach(goishi_w => {
				const is_left_exist  = is_2dimension_array_include(goishi_w, left_ishi)
				const is_right_exist = is_2dimension_array_include(goishi_w, right_ishi)
				const is_top_exist   = is_2dimension_array_include(goishi_w, top_ishi)
				const is_bottom_exist = is_2dimension_array_include(goishi_w, bottom_ishi)
				if (is_left_exist) { left_ishi_result = left_ishi }
				if (is_right_exist) { right_ishi_result = right_ishi }
				if (is_top_exist) { top_ishi_result = top_ishi }
				if (is_bottom_exist) { bottom_ishi_result = bottom_ishi }
			})
			ishi_result.push(left_ishi_result)
			ishi_result.push(right_ishi_result)
			ishi_result.push(top_ishi_result)
			ishi_result.push(bottom_ishi_result)
			ishi_result = ishi_result.filter((ishi) => {
				if (ishi == undefined) { return false }
				return true
			})
			ishi_result.forEach((ishi) => {
				const left_ishi		= ishi![1] - 1 > -1 ? [ishi![0], ishi![1] - 1] : []
				const right_ishi 	= ishi![1] + 1 < GOMAN_WIDTH ? [ishi![0], ishi![1] + 1] : []
				const top_ishi		= ishi![0] + 1 < GOMAN_WIDTH ? [ishi![0] + 1, ishi![1]] : []
				const bottom_ishi	= ishi![0] - 1 > -1 ? [ishi![0] - 1, ishi![1]] : []
				//
				const left_ishi_exist = is_2dimension_array_include(banmen_opposite, left_ishi)
				const right_ishi_exist = is_2dimension_array_include(banmen_opposite, right_ishi)
				const top_ishi_exist = is_2dimension_array_include(banmen_opposite, top_ishi)
				const bottom_ishi_exist = is_2dimension_array_include(banmen_opposite, bottom_ishi)
				console.log("ko result", left_ishi, right_ishi, top_ishi, bottom_ishi)
				if ( left_ishi_exist && right_ishi_exist && top_ishi_exist && bottom_ishi_exist ) {
					setKo([ishi![0], ishi![1]])
				}
			})
			// console.log("goishi white", goishi_block_white_copy)
			console.log("goishi block white", ishi_result)
		}
	}

	const calculate_goishi_block = (banmen_goishi_black_copy: number[][], banmen_goishi_white_copy: number[][]) => {
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
		}
	}

	const is_2dimension_array_include = (array: number[][], item: number[]) => {
		const mapped_array = array.map((a) => a[0].toString() + a[1].toString())
		if (!item[0] && !item[1]) { return false }
		const mapped_item = item[0].toString() + item[1].toString()
		return mapped_array.includes(mapped_item) 
	}

	const startTaikyoku1 = () => {
		initializeGoban()
		taikyoku_tezyun.current = 0
		tezyun_interval.current = setInterval(() => {
			//
			onClickMasu(tezyun.current[taikyoku_tezyun.current][0], tezyun.current[taikyoku_tezyun.current][1])
			taikyoku_tezyun.current = taikyoku_tezyun.current + 1
			if ( taikyoku_tezyun.current == tezyun.current.length ) {
				clearInterval(tezyun_interval.current)
			}
		}, 1000)
	}

	const stopTaikyoku1 = () => {
		clearInterval(tezyun_interval.current)
	}

	const restartTaikyoku1 = () => {
		tezyun_interval.current = setInterval(() => {
			//
			onClickMasu(tezyun.current[taikyoku_tezyun.current][0], tezyun.current[taikyoku_tezyun.current][1])
			taikyoku_tezyun.current = taikyoku_tezyun.current + 1
			if ( taikyoku_tezyun.current == tezyun.current.length ) {
				clearInterval(tezyun_interval.current)
			}
		}, 1000)
	}

	const loadTaikyoku = (e: React.ChangeEvent<HTMLInputElement>) => {
		initializeGoban()
		if (!e.target.files) { return }
		const inputFile = e.target.files[0]
		const reader = new FileReader()
		let file_result;
		reader.readAsText(e.target.files[0]);
		reader.onload = function(event){
			file_result = reader.result as string
			parseSgf(file_result)
		}
	}

	const parseSgf = (file_content: string) => {
		let file_array = file_content.split(";")
		file_array = file_array.map((f) => {
			if (f[0] == "B" || f[0] == "W") {
				return f.slice(2, 4)
			}
			return ""
		}).filter((f) => {
			if (f == "") { return false }
			return true
		})
		const tezyun_result: number[][] = file_array.map((str) => {
			const num1 = covertAlphabetToNum(str[0])
			const num2 = covertAlphabetToNum(str[1])
			return [num1, num2]
		})
		console.log(tezyun_result)
		tezyun.current = tezyun_result
	}

	const covertAlphabetToNum = (str: string) => {
		if (str == "a") { return 0 }
		if (str == "b") { return 1 }
		if (str == "c") { return 2 }
		if (str == "d") { return 3 }
		if (str == "e") { return 4 }
		if (str == "f") { return 5 }
		if (str == "g") { return 6 }
		if (str == "h") { return 7 }
		if (str == "i") { return 8 }
		if (str == "j") { return 9 }
		if (str == "k") { return 10 }
		if (str == "l") { return 11 }
		if (str == "m") { return 12 }
		if (str == "n") { return 13 }
		if (str == "o") { return 14 }
		if (str == "p") { return 15 }
		if (str == "q") { return 16 }
		if (str == "r") { return 17 }
		if (str == "s") { return 18 }
		return 0
	}

	return(
		<>
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
								{j_index == (GOMAN_WIDTH -1) && <br/>}
							</>
						)
					})
				))}
				<button onClick={() => initializeGoban()}>
					初期化する
				</button>
				<br/>
				<div>
					<span>黒アゲハマ{agehama_black}個</span>
					<span>白アゲハマ{agehama_white}個</span>
					<br/>
					{/*<span>コウ [{ko[0]}, {ko[1]}]</span>*/}
				</div>
			</div>
			<div>
				<p>
					SGFファイルを選択することで、棋譜を並べることができます。
					<br/>
					<input
						type="file"
						accept="sgf"
						onChange={(e) => loadTaikyoku(e)}
					/>
				</p>
				対局：	<button onClick={() => startTaikyoku1()}>開始</button>
						<button onClick={() => stopTaikyoku1()}>停止</button>
						<button onClick={() => restartTaikyoku1()}>再開始</button>
			</div>
		</>
	)
}

export default Goban