import React from "react";
import "./Button.css";

export default function Button(props: {
	text: string;
	clickHandler: () => void;
	className?: string;
}) {
	const mouseOverHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.style.backgroundColor = "#255728";
	};

	const mouseOutHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.style.backgroundColor = "#4caf50";
	};

	return (
		<>
			<button
				className={"button " + props.className}
				onClick={props.clickHandler}
				onMouseOver={mouseOverHandler}
				onMouseOut={mouseOutHandler}
			>
				{props.text}
			</button>
		</>
	);
}
