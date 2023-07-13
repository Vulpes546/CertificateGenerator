import React from "react";
import "./Button.css";

export default function Button(props: {
	text: string;
	clickHandler: () => void;
	className?: string;
	disabled?: boolean;
}) {
	return (
		<>
			<button
				className={"button " + props.className}
				onClick={props.clickHandler}
				disabled={props.disabled}
			>
				{props.text}
			</button>
		</>
	);
}
